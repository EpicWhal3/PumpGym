import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsNumber,
  Min,
  Max,
  IsBoolean,
  Length,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateTrainerDto {
  @ApiProperty({ description: "Имя тренера", example: "Наталья Смирнова" })
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  name: string;

  @ApiProperty({
    description: "Специализации",
    example: ["Йога", "Пилатес", "Стретчинг"],
    isArray: true,
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  specialty: string[];

  @ApiProperty({ description: "Опыт работы", example: "7 лет" })
  @IsString()
  @IsNotEmpty()
  experience: string;

  @ApiPropertyOptional({
    description: "Биография",
    example: "Сертифицированный инструктор по йоге",
  })
  @IsString()
  @IsOptional()
  @Length(0, 1000)
  bio?: string;

  @ApiPropertyOptional({
    description: "URL фотографии",
    example: "/uploads/trainers/anna.jpg",
  })
  @IsString()
  @IsOptional()
  photoUrl?: string;

  @ApiPropertyOptional({
    description: "Рейтинг (0-5)",
    minimum: 0,
    maximum: 5,
    example: 4.9,
  })
  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  rating?: number;

  @ApiPropertyOptional({
    description: "Количество отзывов",
    minimum: 0,
    example: 156,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  reviews?: number;

  @ApiPropertyOptional({
    description: "Активен ли тренер",
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
