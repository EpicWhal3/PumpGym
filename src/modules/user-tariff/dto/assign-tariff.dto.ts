import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class AssignTariffDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  tariffId: string;

  @IsString()
  @IsOptional()
  startDate?: string;
}
