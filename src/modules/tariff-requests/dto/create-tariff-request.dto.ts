import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateTariffRequestDto {
  @ApiProperty({ description: "UUID тарифа" })
  @IsUUID()
  @IsNotEmpty()
  tariffId: string;

  @ApiPropertyOptional({ description: "Комментарий пользователя" })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  comment?: string;
}
