import { Resolver, Query, Args, ID } from "@nestjs/graphql";
import { TimetableEntryType } from "../types/timetable-entry.type";
import { TimetableFilterInput } from "../inputs";
import { TimetableService } from "../../modules/timetable/timetable.service";

@Resolver(() => TimetableEntryType)
export class TimetableResolver {
  constructor(private readonly timetableService: TimetableService) {}

  @Query(() => [TimetableEntryType], {
    name: "timetable",
    description: "Получить расписание с фильтрами",
  })
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
  async getTimetableEntry(@Args("id", { type: () => ID }) id: string) {
    return this.timetableService.findOne(id);
  }
}
