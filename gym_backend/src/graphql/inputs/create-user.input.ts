import { InputType, Field } from "@nestjs/graphql";
import { UserRole } from "../../common/enums/user-roles.enum";

@InputType()
export class CreateUserInput {
  @Field({ description: "Имя пользователя" })
  name: string;

  @Field({ description: "Email" })
  email: string;

  @Field({ description: "Телефон" })
  phone: string;

  @Field({ description: "Пароль" })
  password: string;

  @Field(() => UserRole, {
    nullable: true,
    description: "Роль",
    defaultValue: UserRole.CLIENT,
  })
  role?: UserRole;

  @Field({ nullable: true, description: "URL аватара" })
  photoUrl?: string;

  @Field({ nullable: true, description: "Активен ли", defaultValue: true })
  isActive?: boolean;
}
