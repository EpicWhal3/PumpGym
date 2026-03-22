import { CreateTimetableEntryDto } from "./create-timetable-entry.dto";
import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";

export class UpdateTimetableEntryDto extends PartialType(
  CreateTimetableEntryDto,
) {
  @ApiPropertyOptional({ description: "ID занятия (для обновления)" })
  id?: string;
}
