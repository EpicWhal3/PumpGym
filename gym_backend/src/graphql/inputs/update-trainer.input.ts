import { InputType, Field, ID, Float, Int } from "@nestjs/graphql";

@InputType()
export class UpdateTrainerInput {
  @Field(() => ID, { description: "UUID тренера" })
  id: string;

  @Field({ nullable: true, description: "Имя" })
  name?: string;

  @Field(() => [String], { nullable: true, description: "Специализации" })
  specialty?: string[];

  @Field({ nullable: true, description: "Опыт" })
  experience?: string;

  @Field({ nullable: true, description: "Биография" })
  bio?: string;

  @Field({ nullable: true, description: "URL фото" })
  photoUrl?: string;

  @Field(() => Float, { nullable: true, description: "Рейтинг" })
  rating?: number;

  @Field(() => Int, { nullable: true, description: "Отзывы" })
  reviews?: number;

  @Field({ nullable: true, description: "Активен ли" })
  isActive?: boolean;
}
