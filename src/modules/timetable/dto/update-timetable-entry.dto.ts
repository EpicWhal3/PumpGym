import { CreateTimetableEntryDto } from "./create-timetable-entry.dto";
import { PartialType } from "@nestjs/swagger";

export class UpdateTimetableEntryDto extends PartialType(
  CreateTimetableEntryDto,
) {}
