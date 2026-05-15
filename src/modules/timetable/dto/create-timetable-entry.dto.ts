import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsEnum,
  IsUUID,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { WorkoutType } from "../../../common/enums/workout-types.enum";
import { EntryStatus } from "../../../common/enums/entry-status.enum";

export class CreateTimetableEntryDto {
  @ApiProperty({
    description: "Тип тренировки",
    enum: WorkoutType,
    example: WorkoutType.HIIT,
  })
  @IsEnum(WorkoutType)
  @IsNotEmpty()
  type: WorkoutType;

  @ApiProperty({
    description: "ID тренера",
    example: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  })
  @IsUUID()
  @IsNotEmpty()
  trainerId: string;

  @ApiProperty({ description: "Зал", example: "Зал A" })
  @IsString()
  @IsNotEmpty()
  hall: string;

  @ApiProperty({
    description: "Дата занятия (формат: YYYY-MM-DD)",
    example: "2025-12-06",
  })
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({
    description: "Время начала (формат: HH:MM)",
    example: "09:00",
    pattern: "^([01]?[0-9]|2[0-3]):[0-5][0-9]$",
  })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({
    description: "Время окончания (формат: HH:MM)",
    example: "10:00",
    pattern: "^([01]?[0-9]|2[0-3]):[0-5][0-9]$",
  })
  @IsString()
  @IsNotEmpty()
  endTime: string;

  @ApiProperty({
    description: "Максимальное количество участников",
    minimum: 1,
    example: 15,
  })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  capacity: number;

  @ApiPropertyOptional({
    description: "Текущее количество записавшихся",
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  enrolled?: number;

  @ApiPropertyOptional({
    description: "Статус занятия",
    enum: EntryStatus,
    default: EntryStatus.AVAILABLE,
  })
  @IsOptional()
  @IsEnum(EntryStatus)
  status?: "available" | "full" | "cancelled";

  @ApiPropertyOptional({
    description: "Активно ли занятие",
    default: true,
  })
  @IsOptional()
  isActive?: boolean;
}
