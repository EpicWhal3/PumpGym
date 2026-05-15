import { Args, ID, Query, Resolver } from "@nestjs/graphql";
import { TimetableEntryType } from "../types/timetable-entry.type";
import { TimetableFilterInput } from "../inputs";
import { TimetableService } from "../../modules/timetable/timetable.service";
import { Public } from "../../common/decorators/public.decorator";

@Resolver(() => TimetableEntryType)
export class TimetableResolver {
  constructor(private readonly timetableService: TimetableService) {}

  @Query(() => [TimetableEntryType], {
    name: "timetable",
    description: "Получить расписание с фильтрами",
  })
  @Public()
  async getTimetable(
    @Args("filters", { type: () => TimetableFilterInput, nullable: true })
    filters?: TimetableFilterInput,
  ) {
    return this.timetableService.findAll(filters ?? undefined);
  }

  @Query(() => TimetableEntryType, {
    name: "timetableEntry",
    description: "Получить занятие по ID",
  })
  @Public()
  async getTimetableEntry(@Args("id", { type: () => ID }) id: string) {
    return this.timetableService.findOne(id);
  }

  @Query(() => [TimetableEntryType], {
    name: "timetableByTrainer",
    description: "Получить расписание тренера",
  })
  @Public()
  async getTimetableByTrainer(
    @Args("trainerId", { type: () => ID }) trainerId: string,
  ) {
    return this.timetableService.findByTrainer(trainerId);
  }

  @Query(() => [TimetableEntryType], {
    name: "timetableByDate",
    description: "Получить расписание на дату",
  })
  @Public()
  async getTimetableByDate(@Args("date") date: string) {
    return this.timetableService.findByDate(date);
  }
}
