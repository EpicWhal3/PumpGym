import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, EntityManager, Repository } from "typeorm";
import { TimetableEntry, Trainer } from "../../entities";
import { CreateTimetableEntryDto } from "./dto/create-timetable-entry.dto";
import { UpdateTimetableEntryDto } from "./dto/update-timetable-entry.dto";
import { EntryStatus } from "../../common/enums/entry-status.enum";

@Injectable()
export class TimetableService {
  constructor(
    @InjectRepository(TimetableEntry)
    private timetableRepository: Repository<TimetableEntry>,
    @InjectRepository(Trainer)
    private trainerRepository: Repository<Trainer>,
    private dataSource: DataSource,
  ) {}

  async create(
    createTimetableEntryDto: CreateTimetableEntryDto,
  ): Promise<TimetableEntry> {
    const trainer = await this.trainerRepository.findOne({
      where: { id: createTimetableEntryDto.trainerId, isActive: true },
    });

    if (!trainer) {
      throw new NotFoundException("Тренер не найден или не активен");
    }

    const saved = await this.dataSource.transaction(async (manager) => {
      const hasConflict = await this.checkTrainerScheduleConflict(
        createTimetableEntryDto.trainerId,
        createTimetableEntryDto.date,
        createTimetableEntryDto.startTime,
        createTimetableEntryDto.endTime,
        manager,
      );

      if (hasConflict) {
        throw new ConflictException("У тренера уже есть занятие в это время");
      }

      const enrolled = createTimetableEntryDto.enrolled ?? 0;
      const entry = manager.create(TimetableEntry, {
        type: createTimetableEntryDto.type,
        trainerId: createTimetableEntryDto.trainerId,
        hall: createTimetableEntryDto.hall,
        date: new Date(createTimetableEntryDto.date),
        startTime: createTimetableEntryDto.startTime,
        endTime: createTimetableEntryDto.endTime,
        capacity: createTimetableEntryDto.capacity,
        enrolled,
        status: this.calculateStatus(
          enrolled,
          createTimetableEntryDto.capacity,
        ),
        isActive: createTimetableEntryDto.isActive ?? true,
      });

      return await manager.save(entry);
    });

    const result = await this.timetableRepository.findOne({
      where: { id: saved.id },
      relations: ["trainer"],
    });

    if (!result) {
      throw new NotFoundException(
        `Не удалось загрузить созданное занятие с ID "${saved.id}"`,
      );
    }

    return result;
  }

  async findAll(filters?: {
    date?: string;
    trainerId?: string;
    type?: string;
    hall?: string;
  }): Promise<TimetableEntry[]> {
    const where: any = { isActive: true };

    if (filters?.date) {
      where.date = filters.date;
    }
    if (filters?.trainerId) {
      where.trainerId = filters.trainerId;
    }
    if (filters?.type) {
      where.type = filters.type;
    }
    if (filters?.hall) {
      where.hall = filters.hall;
    }

    return await this.timetableRepository.find({
      where,
      relations: ["trainer"],
      order: { date: "ASC", startTime: "ASC" },
    });
  }

  async findOne(id: string): Promise<TimetableEntry> {
    const entry = await this.timetableRepository.findOne({
      where: { id },
      relations: ["trainer"],
    });

    if (!entry) {
      throw new NotFoundException(`Занятие с ID "${id}" не найдено`);
    }

    return entry;
  }

  async update(
    id: string,
    updateTimetableEntryDto: UpdateTimetableEntryDto,
  ): Promise<TimetableEntry> {
    const entry = await this.findOne(id);
    if (
      updateTimetableEntryDto.date ||
      updateTimetableEntryDto.startTime ||
      updateTimetableEntryDto.endTime ||
      updateTimetableEntryDto.trainerId
    ) {
      const trainerId = updateTimetableEntryDto.trainerId ?? entry.trainerId;
      const date = updateTimetableEntryDto.date ?? entry.date.toString();
      const startTime = updateTimetableEntryDto.startTime ?? entry.startTime;
      const endTime = updateTimetableEntryDto.endTime ?? entry.endTime;

      const hasConflict = await this.checkTrainerScheduleConflict(
        trainerId,
        date,
        startTime,
        endTime,
        this.timetableRepository.manager,
        id,
      );

      if (hasConflict) {
        throw new ConflictException("У тренера уже есть занятие в это время");
      }
    }

    Object.assign(entry, updateTimetableEntryDto);

    if (
      updateTimetableEntryDto.capacity !== undefined ||
      updateTimetableEntryDto.enrolled !== undefined
    ) {
      entry.status = this.calculateStatus(entry.enrolled, entry.capacity);
    }

    return await this.timetableRepository.save(entry);
  }

  async remove(id: string): Promise<void> {
    const entry = await this.findOne(id);

    if (entry.enrolled > 0) {
      throw new BadRequestException(
        "Нельзя удалить занятие с записавшимися участниками",
      );
    }

    entry.isActive = false;
    entry.status = EntryStatus.CANCELLED;
    await this.timetableRepository.save(entry);
  }

  async findByTrainer(trainerId: string): Promise<TimetableEntry[]> {
    return await this.timetableRepository.find({
      where: { trainerId, isActive: true },
      relations: ["trainer"],
      order: { date: "ASC", startTime: "ASC" },
    });
  }

  async findByDate(date: string): Promise<TimetableEntry[]> {
    return await this.timetableRepository.find({
      where: { date: new Date(date), isActive: true },
      relations: ["trainer"],
      order: { startTime: "ASC" },
    });
  }

  async incrementEnrolled(
    id: string,
    manager?: EntityManager,
  ): Promise<TimetableEntry> {
    const repo = manager
      ? manager.getRepository(TimetableEntry)
      : this.timetableRepository;

    const entry = await repo.findOne({ where: { id } });
    if (!entry) throw new NotFoundException(`Занятие с ID "${id}" не найдено`);
    if (entry.enrolled >= entry.capacity) {
      throw new BadRequestException("Нет мест в группе");
    }

    entry.enrolled += 1;
    entry.status = this.calculateStatus(entry.enrolled, entry.capacity);
    return await repo.save(entry);
  }

  async decrementEnrolled(id: string): Promise<TimetableEntry> {
    const entry = await this.findOne(id);

    if (entry.enrolled <= 0) {
      throw new BadRequestException("Ошибка: отрицательное количество мест");
    }

    entry.enrolled -= 1;
    entry.status = this.calculateStatus(entry.enrolled, entry.capacity);
    return await this.timetableRepository.save(entry);
  }

  private async checkTrainerScheduleConflict(
    trainerId: string,
    date: string,
    startTime: string,
    endTime: string,
    manager: any,
    excludeId?: string,
  ): Promise<boolean> {
    const existingEntries = await manager.find(TimetableEntry, {
      where: {
        trainerId,
        date,
        isActive: true,
        status: EntryStatus.AVAILABLE,
      },
    });

    for (const existing of existingEntries) {
      if (excludeId && existing.id === excludeId) continue;

      if (
        (startTime >= existing.startTime && startTime < existing.endTime) ||
        (endTime > existing.startTime && endTime <= existing.endTime) ||
        (startTime <= existing.startTime && endTime >= existing.endTime)
      ) {
        return true;
      }
    }

    return false;
  }

  private calculateStatus(enrolled: number, capacity: number): EntryStatus {
    if (enrolled >= capacity) {
      return EntryStatus.FULL;
    }
    return EntryStatus.AVAILABLE;
  }
}
