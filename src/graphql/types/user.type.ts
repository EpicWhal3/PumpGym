import { Field, ID, ObjectType } from "@nestjs/graphql";
import { UserRole } from "../../common/enums/user-roles.enum";

@ObjectType("User")
export class UserType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  phone: string;

  @Field(() => UserRole)
  role: UserRole;

  @Field({ nullable: true })
  photoUrl?: string;

  @Field()
  isActive: boolean;

  @Field()
  registrationDate: Date;
}
