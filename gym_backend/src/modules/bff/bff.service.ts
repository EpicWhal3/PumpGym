import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import * as cacheManager_1 from "cache-manager";
import { TimetableService } from "../timetable/timetable.service";
import { ScheduleCardDto } from "./dto/schedule-card.dto";

@Injectable()
export class BffService {
  constructor(
    private readonly timetableService: TimetableService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: cacheManager_1.Cache,
  ) {}

  async getSchedule(filters?: {
    date?: string;
    trainerId?: string;
    type?: string;
    hall?: string;
  }): Promise<ScheduleCardDto[]> {
    const cacheKey = this.buildScheduleCacheKey(filters);
    const cached = await this.cacheManager.get<ScheduleCardDto[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const entries = await this.timetableService.findAll(filters);
    const result = entries.map((entry) => ({
      id: entry.id,
      type: entry.type,
      date: entry.date,
      startTime: entry.startTime,
      endTime: entry.endTime,
      hall: entry.hall,
      capacity: entry.capacity,
      enrolled: entry.enrolled,
      availableSlots: Math.max(0, entry.capacity - entry.enrolled),
      status: entry.status,
      trainer: entry.trainer
        ? {
            id: entry.trainer.id,
            name: entry.trainer.user?.name,
            photoUrl: entry.trainer.user?.photoUrl,
            specialty: entry.trainer.specialty,
          }
        : null,
    }));

    await this.cacheManager.set(cacheKey, result, 60_000);
    return result;
  }

  async clearScheduleCache(): Promise<void> {
    const store = this.cacheManager.stores?.[0] as any;
    if (store?.reset) {
      await store.reset();
    }
  }

  private buildScheduleCacheKey(filters?: Record<string, unknown>) {
    if (!filters || Object.keys(filters).length === 0) {
      return "bff:schedule:all";
    }

    return `bff:schedule:${Object.entries(filters)
      .filter(
        ([, value]) => value !== undefined && value !== null && value !== "",
      )
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${String(value)}`)
      .join("&")}`;
  }
}
