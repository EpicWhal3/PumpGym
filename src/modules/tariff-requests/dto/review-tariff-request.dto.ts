import { IsOptional, IsString, MaxLength } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class ReviewTariffRequestDto {
  @ApiPropertyOptional({ description: "Комментарий администратора" })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  adminComment?: string;
}
