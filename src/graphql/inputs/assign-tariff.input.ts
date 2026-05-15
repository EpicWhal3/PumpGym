import { Field, ID, InputType } from "@nestjs/graphql";

@InputType()
export class AssignTariffInput {
  @Field(() => ID, { description: "UUID пользователя" })
  userId: string;

  @Field(() => ID, { description: "UUID тарифа" })
  tariffId: string;

  @Field({ nullable: true, description: "Дата начала (YYYY-MM-DD)" })
  startDate?: string;
}
