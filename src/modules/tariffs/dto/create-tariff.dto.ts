import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { TariffType } from "../../../common/enums/tariff-types.enum";

export class CreateTariffDto {
  @ApiProperty({
    description: "Тип тарифа",
    enum: TariffType,
    example: TariffType.PRO,
  })
  @IsEnum(TariffType)
  @IsNotEmpty()
  type: TariffType;

  @ApiPropertyOptional({
    description: "Описание тарифа",
    example: "Оптимальный баланс цены и возможностей",
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: "Цена в рублях", example: 4900, minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  price: number;

  @ApiProperty({
    description: "Длительность в днях",
    example: 30,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  duration: number;

  @ApiProperty({
    description: "Список возможностей",
    example: ["Групповые программы", "Бассейн"],
    isArray: true,
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  features: string[];

  @ApiPropertyOptional({
    description: "Ограничения тарифа",
    example: { timeOfDay: "any" },
  })
  @IsObject()
  @IsOptional()
  restrictions?: {
    timeOfDay?: "10:00-18:00" | "any";
  };

  @ApiPropertyOptional({
    description: "Активен ли тариф",
    default: true,
  })
  @IsOptional()
  isActive?: boolean;
}
