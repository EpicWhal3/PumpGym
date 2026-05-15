import { InputType, Field } from "@nestjs/graphql";
import { ServiceType } from "../../common/enums/service-types.enum";

@InputType()
export class CreateBookingInput {
  @Field({ description: "Имя клиента" })
  name: string;

  @Field({ description: "Телефон" })
  phone: string;

  @Field({ description: "Email" })
  email: string;

  @Field(() => ServiceType, { description: "Тип услуги" })
  serviceType: ServiceType;

  @Field({ description: "Желаемая дата (YYYY-MM-DD)" })
  preferredDate: string;

  @Field({ description: "Желаемое время (HH:MM)" })
  preferredTime: string;

  @Field({ nullable: true, description: "Заметки" })
  notes?: string;

  @Field({ nullable: true, description: "UUID пользователя" })
  userId?: string;
}
