import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  ClassEnrollment,
  TimetableEntry,
  User,
  UserTariff,
} from "../../entities";
import {
  DataSource,
  EntityManager,
  MoreThanOrEqual,
  Repository,
} from "typeorm";
import { CreateEnrollmentDto } from "./dto/create-enrollment.dto";
import { EnrollmentStatus } from "../../common/enums/enrollments-status.enum";
import { EntryStatus } from "../../common/enums/entry-status.enum";
import { TariffState } from "../../common/enums/tariff-status.enum";

@Injectable()
export class EnrollmentService {
  constructor(
    @InjectRepository(ClassEnrollment)
    private enrollmentRepository: Repository<ClassEnrollment>,
    @InjectRepository(TimetableEntry)
    private timetableRepository: Repository<TimetableEntry>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserTariff)
    private userTariffRepository: Repository<UserTariff>,
    private dataSource: DataSource,
  ) {}

  async enrollUser(
    createEnrollmentDto: CreateEnrollmentDto,
  ): Promise<ClassEnrollment> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { userId, timetableEntryId } = createEnrollmentDto;

      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException("Пользователь не найден");
      }
      const entry = await queryRunner.manager.findOne(TimetableEntry, {
        where: { id: timetableEntryId },
        relations: ["trainer"],
      });
      if (!entry) {
        throw new NotFoundException("Занятие не найдено");
      }

      if (entry.status !== EntryStatus.AVAILABLE) {
        throw new BadRequestException(
          "`Запись невозможна: занятие ${entry.status === 'full' ? " +
            "'заполнено' : 'отменено'}`,",
        );
      }

      if (entry.enrolled >= entry.capacity) {
        throw new BadRequestException("Нет мест в группе");
      }

      const existingEnrollment = await queryRunner.manager.findOne(
        ClassEnrollment,
        {
          where: {
            user: { id: userId },
            timetableEntry: { id: timetableEntryId },
          },
        },
      );
      if (existingEnrollment) {
        throw new BadRequestException("Вы уже записаны на это занятие");
      }

      await this.checkActiveTariff(userId, queryRunner.manager);

      const enrollment = queryRunner.manager.create(ClassEnrollment, {
        user: { id: userId },
        timetableEntry: { id: timetableEntryId },
        status: EnrollmentStatus.CONFIRMED,
      });
      await queryRunner.manager.save(enrollment);

      entry.enrolled += 1;

      if (entry.enrolled >= entry.capacity) {
        entry.status = EntryStatus.FULL;
      }

      await queryRunner.manager.save(entry);
      await queryRunner.commitTransaction();
      return enrollment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async checkActiveTariff(
    userId: string,
    manager: EntityManager,
  ): Promise<void> {
    const now = new Date();

    const activeTariff = await manager.findOne(UserTariff, {
      where: {
        user: { id: userId },
        status: TariffState.ACTIVE,
        endDate: MoreThanOrEqual(now),
      },
    });

    if (!activeTariff) {
      throw new ForbiddenException(
        "Для записи на занятие требуется действующий тариф",
      );
    }
  }

  async cancelEnrollment(userId: string, enrollmentId: string): Promise<void> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id: enrollmentId, user: { id: userId } },
      relations: ["timetableEntry"],
    });

    if (!enrollment) {
      throw new NotFoundException("Запись не найдена");
    }
    if (enrollment.status === EnrollmentStatus.CANCELLED) {
      throw new BadRequestException("Запись уже отменена");
    }
    if (enrollment.status === EnrollmentStatus.ATTENDED) {
      throw new BadRequestException("Нельзя отменить посещённое занятие");
    }

    enrollment.status = EnrollmentStatus.CANCELLED;
    await this.enrollmentRepository.save(enrollment);

    enrollment.timetableEntry.enrolled -= 1;
    enrollment.timetableEntry.status = EntryStatus.AVAILABLE;
    await this.timetableRepository.save(enrollment.timetableEntry);
  }

  async findByUser(userId: string): Promise<ClassEnrollment[]> {
    return await this.enrollmentRepository.find({
      where: { user: { id: userId } },
      relations: ["timetableEntry", "timetableEntry.trainer"],
      order: { createdAt: "DESC" },
    });
  }

  async findByTimetableEntry(
    timetableEntryId: string,
  ): Promise<ClassEnrollment[]> {
    return await this.enrollmentRepository.find({
      where: { timetableEntry: { id: timetableEntryId } },
      relations: ["user"],
    });
  }

  async markAttended(enrollmentId: string): Promise<ClassEnrollment> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id: enrollmentId },
    });

    if (!enrollment) {
      throw new NotFoundException("Запись не найдена");
    }

    enrollment.status = EnrollmentStatus.ATTENDED;
    return await this.enrollmentRepository.save(enrollment);
  }
}
