import { Field, ID, ObjectType } from "@nestjs/graphql";
import { EnrollmentStatus } from "../../common/enums/enrollments-status.enum";
import { UserType } from "./user.type";
import { TimetableEntryType } from "./timetable-entry.type";

@ObjectType("Enrollment")
export class EnrollmentType {
  @Field(() => ID)
  id: string;

  @Field(() => EnrollmentStatus)
  status: EnrollmentStatus;

  @Field()
  createdAt: Date;

  @Field(() => UserType, { nullable: true })
  user?: UserType;

  @Field(() => TimetableEntryType, { nullable: true })
  timetableEntry?: TimetableEntryType;
}
