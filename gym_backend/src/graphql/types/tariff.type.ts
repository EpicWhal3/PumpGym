import { ObjectType, Field, ID, Int } from "@nestjs/graphql";
import { TariffType as TariffTypeEnum } from "../../common/enums/tariff-types.enum";
import GraphQLJSON from "graphql-type-json";

@ObjectType("Tariff")
export class TariffObjectType {
  @Field(() => ID)
  id: string;

  @Field(() => TariffTypeEnum)
  type: TariffTypeEnum;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int)
  price: number;

  @Field(() => Int)
  duration: number;

  @Field(() => [String])
  features: string[];

  @Field(() => GraphQLJSON, { nullable: true })
  restrictions?: Record<string, any>;

  @Field()
  isActive: boolean;
}
