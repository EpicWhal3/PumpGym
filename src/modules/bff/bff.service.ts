import { Injectable, NotFoundException } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { TimetableService } from "../timetable/timetable.service";
import { EnrollmentService } from "../enrollments/enrollment.service";
import { AssignTariffService } from "../user-tariff/assign-tariff.service";
import { TariffsService } from "../tariffs/tariff.service";
import { TrainersService } from "../trainers/trainers.service";
import { BookingsService } from "../bookings/bookings.service";
import {
  BffAdminDashboardResponseDto,
  BffHomeResponseDto,
  BffProfileResponseDto,
} from "./dto";
import { TariffRequestsService } from "../tariff-requests/tariff-requests.service";

@Injectable()
export class BffService {
  constructor(
    private readonly usersService: UsersService,
    private readonly timetableService: TimetableService,
    private readonly enrollmentService: EnrollmentService,
    private readonly assignTariffService: AssignTariffService,
    private readonly tariffsService: TariffsService,
    private readonly trainersService: TrainersService,
    private readonly bookingsService: BookingsService,
    private readonly tariffRequestsService: TariffRequestsService,
  ) {}

  async getSchedule(date?: string) {
    const entries = date
      ? await this.timetableService.findByDate(date)
      : await this.timetableService.findAll();

    return {
      date,
      entries: entries.map((entry) => ({
        id: entry.id,
        type: entry.type,
        hall: entry.hall,
        date: entry.date,
        startTime: entry.startTime,
        endTime: entry.endTime,
        capacity: entry.capacity,
        enrolled: entry.enrolled,
        availableSlots: Math.max(0, entry.capacity - entry.enrolled),
        status: entry.status,
        trainer: entry.trainer
          ? {
              id: entry.trainer.id,
              name: entry.trainer.user?.name ?? "Unknown trainer",
            }
          : null,
      })),
    };
  }

  async getProfile(userId: string): Promise<BffProfileResponseDto> {
    const user = await this.usersService.findOne(userId);

    if (!user) {
      throw new NotFoundException("Пользователь не найден");
    }

    const [activeTariff, enrollments] = await Promise.all([
      this.assignTariffService.getActiveTariff(userId),
      this.enrollmentService.findByUser(userId),
    ]);

    const mappedEnrollments = enrollments.map((enrollment) => ({
      id: enrollment.id,
      status: enrollment.status,
      createdAt: enrollment.createdAt,
      timetableEntry: enrollment.timetableEntry
        ? {
            id: enrollment.timetableEntry.id,
            type: enrollment.timetableEntry.type,
            date: enrollment.timetableEntry.date,
            startTime: enrollment.timetableEntry.startTime,
            endTime: enrollment.timetableEntry.endTime,
            hall: enrollment.timetableEntry.hall,
            trainer: enrollment.timetableEntry.trainer
              ? {
                  id: enrollment.timetableEntry.trainer.id,
                  name:
                    enrollment.timetableEntry.trainer.user?.name ??
                    "Неизвестный тренер",
                }
              : null,
          }
        : null,
    }));

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        photoUrl: user.photoUrl ?? null,
        registrationDate: user.registrationDate,
      },
      activeTariff: activeTariff
        ? {
            id: activeTariff.id,
            startDate: activeTariff.startDate,
            endDate: activeTariff.endDate,
            status: activeTariff.status,
            tariff: activeTariff.tariff
              ? {
                  id: activeTariff.tariff.id,
                  type: activeTariff.tariff.type,
                  description: activeTariff.tariff.description ?? null,
                }
              : null,
          }
        : null,
      upcomingEnrollments: mappedEnrollments.filter(
        (item) => item.status === "confirmed",
      ),
      attendedEnrollments: mappedEnrollments.filter(
        (item) => item.status === "attended",
      ),
    };
  }

  async getHome(): Promise<BffHomeResponseDto> {
    const [tariffs, trainers, timetable] = await Promise.all([
      this.tariffsService.findAll(true),
      this.trainersService.getTopRated(3),
      this.timetableService.findAll(),
    ]);

    const now = new Date();

    const upcomingClasses = timetable
      .filter((entry) => {
        const entryDate = new Date(entry.date);
        return entryDate >= new Date(now.toDateString());
      })
      .sort((a, b) => {
        const dateCompare =
          new Date(a.date).getTime() - new Date(b.date).getTime();
        if (dateCompare !== 0) return dateCompare;
        return a.startTime.localeCompare(b.startTime);
      })
      .slice(0, 6);

    return {
      tariffs: tariffs.map((tariff) => ({
        id: tariff.id,
        type: tariff.type,
        description: tariff.description ?? null,
        price: tariff.price,
        duration: tariff.duration,
        features: tariff.features,
        isActive: tariff.isActive,
      })),
      trainers: trainers.map((trainer) => ({
        id: trainer.id,
        name: trainer.user?.name ?? "Неизвестный тренер",
        specialty: trainer.specialty,
        experience: trainer.experience ?? null,
        bio: trainer.bio ?? null,
        photoUrl: trainer.user?.photoUrl ?? null,
        rating: trainer.rating ?? null,
        reviews: trainer.reviews,
      })),
      upcomingClasses: upcomingClasses.map((entry) => ({
        id: entry.id,
        type: entry.type,
        hall: entry.hall,
        date: entry.date,
        startTime: entry.startTime,
        endTime: entry.endTime,
        capacity: entry.capacity,
        enrolled: entry.enrolled,
        availableSlots: Math.max(0, entry.capacity - entry.enrolled),
        status: entry.status,
        trainer: entry.trainer
          ? {
              id: entry.trainer.id,
              name: entry.trainer.user?.name ?? "Unknown trainer",
            }
          : null,
      })),
    };
  }

  async getAdminDashboard(): Promise<BffAdminDashboardResponseDto> {
    const [
      allUsers,
      allTrainers,
      activeTariffs,
      allBookings,
      pendingTariffRequestsCount,
    ] = await Promise.all([
      this.usersService.findAll(),
      this.trainersService.findAll(),
      this.tariffsService.findAll(true),
      this.bookingsService.findAll(),
      this.tariffRequestsService.countPending(),
    ]);

    return {
      totalUsers: allUsers.length,
      totalActiveUsers: allUsers.filter((user) => user.isActive).length,
      totalTrainers: allTrainers.length,
      totalActiveTariffs: activeTariffs.length,
      totalPendingBookings: allBookings.filter(
        (booking) => booking.status === "pending",
      ).length,
      totalPendingTariffRequests: pendingTariffRequestsCount,
    };
  }
}
