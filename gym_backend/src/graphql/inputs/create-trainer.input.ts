import { InputType, Field, Float, Int } from "@nestjs/graphql";

@InputType()
export class CreateTrainerInput {
  @Field({ description: "Имя тренера" })
  name: string;

  @Field(() => [String], { description: "Специализации" })
  specialty: string[];

  @Field({ description: "Опыт работы" })
  experience: string;

  @Field({ nullable: true, description: "Биография" })
  bio?: string;

  @Field({ nullable: true, description: "URL фото" })
  photoUrl?: string;

  @Field(() => Float, { nullable: true, description: "Рейтинг (0-5)" })
  rating?: number;

  @Field(() => Int, { nullable: true, description: "Количество отзывов" })
  reviews?: number;

  @Field({ nullable: true, description: "Активен ли", defaultValue: true })
  isActive?: boolean;
}
