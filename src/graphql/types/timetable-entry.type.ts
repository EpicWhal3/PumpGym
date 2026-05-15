import { ObjectType, Field, ID, Int } from "@nestjs/graphql";
import { WorkoutType } from "../../common/enums/workout-types.enum";
import { EntryStatus } from "../../common/enums/entry-status.enum";
import { TrainerType } from "./trainer.type";

@ObjectType("TimetableEntry")
export class TimetableEntryType {
  @Field(() => ID)
  id: string;

  @Field(() => WorkoutType)
  type: WorkoutType;

  @Field()
  hall: string;

  @Field()
  date: Date;

  @Field()
  startTime: string;

  @Field()
  endTime: string;

  @Field(() => Int)
  capacity: number;

  @Field(() => Int)
  enrolled: number;

  @Field(() => EntryStatus)
  status: EntryStatus;

  @Field()
  isActive: boolean;

  @Field(() => TrainerType, { nullable: true })
  trainer?: TrainerType;
}
