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
import { TimetableService } from "../timetable/timetable.service";

@Injectable()
export class EnrollmentService {
  constructor(
    @InjectRepository(ClassEnrollment)
    private enrollmentRepository: Repository<ClassEnrollment>,
    private timetableService: TimetableService,
    private dataSource: DataSource,
  ) {}

  async enrollUser(
    createEnrollmentDto: CreateEnrollmentDto,
  ): Promise<ClassEnrollment> {
    return this.dataSource.transaction(async (manager) => {
      const { userId, timetableEntryId } = createEnrollmentDto;

      const user = await manager.findOne(User, {
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException("Пользователь не найден");
      }

      const entry = await manager.findOne(TimetableEntry, {
        where: { id: timetableEntryId },
        relations: ["trainer"],
      });
      if (!entry) {
        throw new NotFoundException("Занятие не найдено");
      }

      if (entry.status !== EntryStatus.AVAILABLE) {
        const reason =
          entry.status === EntryStatus.FULL ? "заполнено" : "отменено";
        throw new BadRequestException(`Запись невозможна: занятие ${reason}`);
      }

      if (entry.enrolled >= entry.capacity) {
        throw new BadRequestException("Нет мест в группе");
      }

      const existingEnrollment = await manager.findOne(ClassEnrollment, {
        where: {
          user: { id: userId },
          timetableEntry: { id: timetableEntryId },
          status: EnrollmentStatus.CONFIRMED,
        },
      });
      if (existingEnrollment) {
        throw new BadRequestException("Вы уже записаны на это занятие");
      }

      await this.checkActiveTariff(userId, manager);

      const enrollment = manager.create(ClassEnrollment, {
        user: { id: userId },
        timetableEntry: { id: timetableEntryId },
        status: EnrollmentStatus.CONFIRMED,
      });
      await manager.save(enrollment);

      await this.timetableService.incrementEnrolled(timetableEntryId, manager);

      return enrollment;
    });
  }

  private async checkActiveTariff(
    userId: string,
    manager: EntityManager,
  ): Promise<void> {
    const now = new Date();

    const activeTariff = await manager.findOne(UserTariff, {
      where: {
        userId,
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

    await this.timetableService.decrementEnrolled(enrollment.timetableEntry.id);
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

    if (enrollment.status !== EnrollmentStatus.CONFIRMED) {
      throw new BadRequestException(
        "Отметить посещение можно только для подтверждённой записи",
      );
    }

    enrollment.status = EnrollmentStatus.ATTENDED;
    return await this.enrollmentRepository.save(enrollment);
  }

  async findAll(): Promise<ClassEnrollment[]> {
    return await this.enrollmentRepository.find({
      relations: ["user", "timetableEntry", "timetableEntry.trainer"],
      order: { createdAt: "DESC" },
    });
  }

  async findOne(id: string): Promise<ClassEnrollment> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id },
      relations: ["user", "timetableEntry", "timetableEntry.trainer"],
    });

    if (!enrollment) {
      throw new NotFoundException("Запись не найдена");
    }

    return enrollment;
  }
}
