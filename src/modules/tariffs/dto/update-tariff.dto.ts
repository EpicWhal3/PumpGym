import { CreateTariffDto } from "./create-tariff.dto";
import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";

export class UpdateTariffDto extends PartialType(CreateTariffDto) {
  @ApiPropertyOptional({ description: "ID тарифа (для обновления)" })
  id?: string;
}
