import { InputType, Field, ID, Int } from "@nestjs/graphql";
import GraphQLJSON from "graphql-type-json";

@InputType()
export class UpdateTariffInput {
  @Field(() => ID, { description: "UUID тарифа" })
  id: string;

  @Field({ nullable: true, description: "Описание" })
  description?: string;

  @Field(() => Int, { nullable: true, description: "Цена" })
  price?: number;

  @Field(() => Int, { nullable: true, description: "Длительность" })
  duration?: number;

  @Field(() => [String], { nullable: true, description: "Возможности" })
  features?: string[];

  @Field(() => GraphQLJSON, { nullable: true, description: "Ограничения" })
  restrictions?: Record<string, any>;

  @Field({ nullable: true, description: "Активен ли" })
  isActive?: boolean;
}
