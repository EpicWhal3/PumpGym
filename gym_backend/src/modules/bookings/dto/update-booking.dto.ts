import { CreateBookingDto } from "./create-booking.dto";
import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";

export class UpdateBookingDto extends PartialType(CreateBookingDto) {
  @ApiPropertyOptional({ description: "ID заявки (для обновления)" })
  id?: string;

  @ApiPropertyOptional({ description: "Изменение статуса заявки" })
  status?: string;
}
