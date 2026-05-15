import { Args, ID, Query, Resolver } from "@nestjs/graphql";
import { UserType } from "../types/user.type";
import { UsersService } from "../../modules/users/users.service";
import { UserRole } from "../../common/enums/user-roles.enum";
import { Roles } from "../../common/decorators/roles.decorator";

@Resolver(() => UserType)
export class UserResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [UserType], {
    name: "users",
    description: "Получить список пользователей",
  })
  @Roles(UserRole.ADMIN)
  async getUsers(
    @Args("role", { type: () => UserRole, nullable: true }) role?: UserRole,
    @Args("isActive", { nullable: true }) isActive?: boolean,
  ) {
    const filters: { role?: UserRole; isActive?: boolean } = {};
    if (role) filters.role = role;
    if (isActive !== undefined) filters.isActive = isActive;
    return this.usersService.findAll(filters);
  }

  @Query(() => UserType, {
    name: "user",
    description: "Получить пользователя по ID",
  })
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.TRAINER)
  async getUser(@Args("id", { type: () => ID }) id: string) {
    return this.usersService.findOne(id);
  }

  @Query(() => UserType, {
    name: "userByEmail",
    description: "Найти пользователя по email",
    nullable: true,
  })
  @Roles(UserRole.ADMIN)
  async getUserByEmail(@Args("email") email: string) {
    return this.usersService.findByEmail(email);
  }

  @Query(() => [UserType], {
    name: "usersByRole",
    description: "Получить пользователей по роли",
  })
  @Roles(UserRole.ADMIN)
  async getUsersByRole(@Args("role", { type: () => UserRole }) role: UserRole) {
    return this.usersService.findByRole(role);
  }
}
