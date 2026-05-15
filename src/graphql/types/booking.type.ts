import { Field, ID, ObjectType } from "@nestjs/graphql";
import { ServiceType } from "../../common/enums/service-types.enum";
import { BookingStatus } from "../../common/enums/booking-status.enum";
import { UserType } from "./user.type";

@ObjectType("Booking")
export class BookingType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  phone: string;

  @Field(() => ServiceType)
  serviceType: ServiceType;

  @Field()
  preferredDate: Date;

  @Field()
  preferredTime: string;

  @Field(() => BookingStatus)
  status: BookingStatus;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  notes?: string;

  @Field(() => UserType, { nullable: true })
  user?: UserType;
}
