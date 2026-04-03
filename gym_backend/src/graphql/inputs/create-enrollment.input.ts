import { InputType, Field, ID } from "@nestjs/graphql";

@InputType()
export class CreateEnrollmentInput {
  @Field(() => ID, { description: "UUID пользователя" })
  userId: string;

  @Field(() => ID, { description: "UUID занятия в расписании" })
  timetableEntryId: string;
}
