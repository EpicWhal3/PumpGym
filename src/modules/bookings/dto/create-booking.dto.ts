import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from "class-validator";
import { ServiceType } from "../../../common/enums/service-types.enum";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateBookingDto {
  @ApiProperty({ description: "Имя клиента", example: "Иван Иванов" })
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  name: string;

  @ApiProperty({ description: "Телефон", example: "+79991234567" })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: "Email", example: "ivan@example.com" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: "Тип услуги", enum: ServiceType })
  @IsEnum(ServiceType)
  @IsNotEmpty()
  serviceType: ServiceType;

  @ApiPropertyOptional({ description: "ID предпочитаемого тренера" })
  @IsString()
  @IsOptional()
  preferredTrainerId?: string;

  @ApiProperty({
    description: "Желаемая дата (YYYY-MM-DD)",
    example: "2025-07-01",
  })
  @IsString()
  @IsNotEmpty()
  preferredDate: string;

  @ApiProperty({ description: "Желаемое время (HH:MM)", example: "10:00" })
  @IsString()
  @IsNotEmpty()
  preferredTime: string;

  @ApiPropertyOptional({ description: "Заметки", example: "Первое посещение" })
  @IsString()
  @IsOptional()
  @Length(0, 500)
  notes?: string;

  @ApiPropertyOptional({ description: "ID пользователя (если авторизован)" })
  @IsString()
  @IsOptional()
  userId?: string;
}
