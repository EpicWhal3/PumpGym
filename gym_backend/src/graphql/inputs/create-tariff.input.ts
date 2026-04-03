import { InputType, Field, Int } from "@nestjs/graphql";
import { TariffType } from "../../common/enums/tariff-types.enum";
import GraphQLJSON from "graphql-type-json";

@InputType()
export class CreateTariffInput {
  @Field(() => TariffType, { description: "Тип тарифа" })
  type: TariffType;

  @Field({ nullable: true, description: "Описание" })
  description?: string;

  @Field(() => Int, { description: "Цена в рублях" })
  price: number;

  @Field(() => Int, { description: "Длительность в днях" })
  duration: number;

  @Field(() => [String], { description: "Список возможностей" })
  features: string[];

  @Field(() => GraphQLJSON, { nullable: true, description: "Ограничения" })
  restrictions?: Record<string, any>;

  @Field({ nullable: true, description: "Активен ли", defaultValue: true })
  isActive?: boolean;
}
