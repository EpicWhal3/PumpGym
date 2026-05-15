import { IsEnum, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { BookingStatus } from "../../../common/enums/booking-status.enum";

export class UpdateBookingStatusDto {
  @ApiProperty({
    description: "Новый статус заявки",
    enum: BookingStatus,
    example: BookingStatus.CONFIRMED,
  })
  @IsEnum(BookingStatus)
  @IsNotEmpty()
  status: BookingStatus;
}
