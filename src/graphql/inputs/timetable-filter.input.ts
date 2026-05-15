import { InputType, Field } from "@nestjs/graphql";
import { WorkoutType } from "../../common/enums/workout-types.enum";

@InputType()
export class TimetableFilterInput {
  @Field({ nullable: true, description: "Дата (YYYY-MM-DD)" })
  date?: string;

  @Field({ nullable: true, description: "UUID тренера" })
  trainerId?: string;

  @Field(() => WorkoutType, { nullable: true, description: "Тип тренировки" })
  type?: WorkoutType;

  @Field({ nullable: true, description: "Зал" })
  hall?: string;
}
