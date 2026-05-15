import { Field, ID, InputType } from "@nestjs/graphql";
import { UserRole } from "../../common/enums/user-roles.enum";

@InputType()
export class UpdateUserInput {
  @Field(() => ID, { description: "UUID пользователя" })
  id: string;

  @Field({ nullable: true, description: "Имя" })
  name?: string;

  @Field({ nullable: true, description: "Email" })
  email?: string;

  @Field({ nullable: true, description: "Телефон" })
  phone?: string;

  @Field({ nullable: true, description: "Пароль" })
  password?: string;

  @Field(() => UserRole, { nullable: true, description: "Роль" })
  role?: UserRole;

  @Field({ nullable: true, description: "URL аватара" })
  photoUrl?: string;

  @Field({ nullable: true, description: "Активен ли" })
  isActive?: boolean;
}
