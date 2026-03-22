import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
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
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const trainer = await queryRunner.manager.findOne(Trainer, {
        where: { id: createTimetableEntryDto.trainerId, isActive: true },
      });

      if (!trainer) {
        throw new NotFoundException("Тренер не найден или не активен");
      }

      const hasConflict = await this.checkTrainerScheduleConflict(
        createTimetableEntryDto.trainerId,
        createTimetableEntryDto.date,
        createTimetableEntryDto.startTime,
        createTimetableEntryDto.endTime,
        queryRunner.manager,
      );

      if (hasConflict) {
        throw new ConflictException("У тренера уже есть занятие в это время");
      }

      const entry = queryRunner.manager.create(TimetableEntry, {
        ...createTimetableEntryDto,
        enrolled: createTimetableEntryDto.enrolled ?? 0,
        status: this.calculateStatus(
          createTimetableEntryDto.enrolled ?? 0,
          createTimetableEntryDto.capacity,
        ),
        isActive: createTimetableEntryDto.isActive ?? true,
      });

      await queryRunner.manager.save(entry);
      await queryRunner.commitTransaction();

      return entry;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
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
      where.trainer = { id: filters.trainerId };
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

    Object.assign(entry, updateTimetableEntryDto);

    if (updateTimetableEntryDto.capacity || updateTimetableEntryDto.enrolled) {
      entry.status = this.calculateStatus(entry.enrolled, entry.capacity);
    }

    return await this.timetableRepository.save(entry);
  }

  /**
   * DELETE: Мягкое удаление занятия
   * Бизнес-логика:
   * - Нельзя удалять, если есть записавшиеся
   */
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
      where: { trainer: { id: trainerId }, isActive: true },
      relations: ["trainer"],
      order: { date: "ASC", startTime: "ASC" },
    });
  }

  /**
   * Получить занятия по дате
   */
  async findByDate(date: string): Promise<TimetableEntry[]> {
    return await this.timetableRepository.find({
      where: { date: new Date(date), isActive: true },
      relations: ["trainer"],
      order: { startTime: "ASC" },
    });
  }

  async incrementEnrolled(id: string): Promise<TimetableEntry> {
    const entry = await this.findOne(id);

    if (entry.enrolled >= entry.capacity) {
      throw new BadRequestException("Нет мест в группе");
    }

    entry.enrolled += 1;
    entry.status = this.calculateStatus(entry.enrolled, entry.capacity);

    return await this.timetableRepository.save(entry);
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
  ): Promise<boolean> {
    const existingEntries = await manager.find(TimetableEntry, {
      where: {
        trainer: { id: trainerId },
        date,
        isActive: true,
        status: "available",
      },
    });

    for (const existing of existingEntries) {
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
