import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import * as cacheManager_1 from "cache-manager";
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
    @Inject(CACHE_MANAGER) private readonly cacheManager: cacheManager_1.Cache,
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

    await this.clearScheduleCache();

    return this.findOne(saved.id);
  }

  async findAll(filters?: any): Promise<TimetableEntry[]> {
    const query = this.timetableRepository
      .createQueryBuilder("entry")
      .leftJoinAndSelect("entry.trainer", "trainer")
      .leftJoinAndSelect("trainer.user", "user")
      .where("entry.isActive = :isActive", { isActive: true });

    if (filters?.date) {
      query.andWhere("entry.date = :date", { date: filters.date });
    }

    if (filters?.trainerId) {
      query.andWhere("entry.trainerId = :trainerId", {
        trainerId: filters.trainerId,
      });
    }

    if (filters?.type) {
      query.andWhere("entry.type = :type", { type: filters.type });
    }

    if (filters?.hall) {
      query.andWhere("entry.hall = :hall", { hall: filters.hall });
    }

    return await query
      .orderBy("entry.date", "ASC")
      .addOrderBy("entry.startTime", "ASC")
      .getMany();
  }

  async findOne(id: string): Promise<TimetableEntry> {
    const entry = await this.timetableRepository.findOne({
      where: { id },
      relations: ["trainer", "trainer.user"],
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
      const date =
        updateTimetableEntryDto.date ?? entry.date.toISOString().slice(0, 10);
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

    if (updateTimetableEntryDto.date) {
      entry.date = new Date(updateTimetableEntryDto.date);
    }

    if (
      updateTimetableEntryDto.capacity !== undefined ||
      updateTimetableEntryDto.enrolled !== undefined
    ) {
      entry.status = this.calculateStatus(entry.enrolled, entry.capacity);
    }

    const saved = await this.timetableRepository.save(entry);
    await this.clearScheduleCache();
    return this.findOne(saved.id);
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
    await this.clearScheduleCache();
  }

  async findByTrainer(trainerId: string): Promise<TimetableEntry[]> {
    return await this.findAll({ trainerId });
  }

  async findByDate(date: string): Promise<TimetableEntry[]> {
    return await this.findAll({ date });
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
    const saved = await repo.save(entry);
    if (!manager) {
      await this.clearScheduleCache();
    }
    return saved;
  }

  async decrementEnrolled(id: string): Promise<TimetableEntry> {
    const entry = await this.findOne(id);

    if (entry.enrolled <= 0) {
      throw new BadRequestException("Ошибка: отрицательное количество мест");
    }

    entry.enrolled -= 1;
    entry.status = this.calculateStatus(entry.enrolled, entry.capacity);
    const saved = await this.timetableRepository.save(entry);
    await this.clearScheduleCache();
    return saved;
  }

  private async checkTrainerScheduleConflict(
    trainerId: string,
    date: string,
    startTime: string,
    endTime: string,
    manager: EntityManager,
    excludeId?: string,
  ): Promise<boolean> {
    const existingEntries = await manager.find(TimetableEntry, {
      where: {
        trainerId,
        date: new Date(date),
        isActive: true,
      },
    });

    return existingEntries.some((existing) => {
      if (excludeId && existing.id === excludeId) return false;
      if (existing.status === EntryStatus.CANCELLED) return false;
      return startTime < existing.endTime && endTime > existing.startTime;
    });
  }

  private calculateStatus(enrolled: number, capacity: number): EntryStatus {
    if (enrolled >= capacity) {
      return EntryStatus.FULL;
    }
    return EntryStatus.AVAILABLE;
  }

  private async clearScheduleCache(): Promise<void> {
    const store = this.cacheManager.stores?.[0] as any;
    if (store?.reset) {
      await store.reset();
    }
  }
}
