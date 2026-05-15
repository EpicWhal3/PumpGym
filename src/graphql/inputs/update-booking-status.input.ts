import { Field, ID, InputType } from "@nestjs/graphql";
import { BookingStatus } from "../../common/enums/booking-status.enum";

@InputType()
export class UpdateBookingStatusInput {
  @Field(() => ID, { description: "UUID заявки" })
  id: string;

  @Field(() => BookingStatus, { description: "Новый статус" })
  status: BookingStatus;
}
