import { ObjectType, Field, ID, Float, Int } from "@nestjs/graphql";
import { UserType } from "./user.type";

@ObjectType("Trainer")
export class TrainerType {
  @Field(() => ID)
  id: string;

  @Field(() => UserType)
  user: UserType;

  @Field()
  name: string;

  @Field(() => [String])
  specialty: string[];

  @Field({ nullable: true })
  experience?: string;

  @Field({ nullable: true })
  bio?: string;

  @Field({ nullable: true })
  photoUrl?: string;

  @Field(() => Float, { nullable: true })
  rating?: number;

  @Field(() => Int)
  reviews: number;

  @Field()
  isActive: boolean;
}
