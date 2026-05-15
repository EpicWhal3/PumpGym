import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateEnrollmentDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  timetableEntryId: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
