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
  IsUUID,
  ValidateIf,
  IsEmail,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateTrainerDto {
  @ApiPropertyOptional({
    description: "UUID существующего пользователя (если уже зарегистрирован)",
    example: "uuid-существующего-user",
  })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({
    description: "Имя тренера",
    example: "Наталья Смирнова",
  })
  @ValidateIf((o) => !o.userId)
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  name?: string;

  @ApiPropertyOptional({ description: "Email", example: "natalia@gym.ru" })
  @ValidateIf((o) => !o.userId)
  @IsEmail()
  @IsNotEmpty()
  email?: string;

  @ApiPropertyOptional({ description: "Телефон", example: "+79991234567" })
  @ValidateIf((o) => !o.userId)
  @IsString()
  @IsNotEmpty()
  @Length(10, 20)
  phone?: string;

  @ApiPropertyOptional({ description: "Пароль", example: "trainerPass123" })
  @ValidateIf((o) => !o.userId)
  @IsString()
  @IsNotEmpty()
  @Length(6, 255)
  password?: string;

  @ApiPropertyOptional({
    description: "URL фотографии",
    example: "/uploads/trainers/natalia.jpg",
  })
  @IsString()
  @IsOptional()
  photoUrl?: string;

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
