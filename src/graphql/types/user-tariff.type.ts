import { Field, ID, ObjectType } from "@nestjs/graphql";
import { TariffState } from "../../common/enums/tariff-status.enum";
import { UserType } from "./user.type";
import { TariffObjectType } from "./tariff.type";

@ObjectType("UserTariff")
export class UserTariffType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  userId: string;

  @Field(() => ID)
  tariffId: string;

  @Field()
  startDate: Date;

  @Field()
  endDate: Date;

  @Field(() => TariffState)
  status: TariffState;

  @Field()
  createdAt: Date;

  @Field(() => UserType, { nullable: true })
  user?: UserType;

  @Field(() => TariffObjectType, { nullable: true })
  tariff?: TariffObjectType;
}
