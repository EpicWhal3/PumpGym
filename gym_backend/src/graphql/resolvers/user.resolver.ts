import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import { UserType } from "../types/user.type";
import { CreateUserInput, UpdateUserInput } from "../inputs";
import { UsersService } from "../../modules/users/users.service";
import { UserRole } from "../../common/enums/user-roles.enum";

@Resolver(() => UserType)
export class UserResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [UserType], {
    name: "users",
    description: "Получить список пользователей",
  })
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
  async getUser(@Args("id", { type: () => ID }) id: string) {
    return this.usersService.findOne(id);
  }

  @Query(() => UserType, {
    name: "userByEmail",
    description: "Найти пользователя по email",
    nullable: true,
  })
  async getUserByEmail(@Args("email") email: string) {
    return this.usersService.findByEmail(email);
  }

  @Query(() => [UserType], {
    name: "usersByRole",
    description: "Получить пользователей по роли",
  })
  async getUsersByRole(@Args("role", { type: () => UserRole }) role: UserRole) {
    return this.usersService.findByRole(role);
  }

  @Mutation(() => UserType, {
    name: "createUser",
    description: "Создать пользователя",
  })
  async createUser(@Args("input") input: CreateUserInput) {
    return this.usersService.create(input);
  }

  @Mutation(() => UserType, {
    name: "updateUser",
    description: "Обновить пользователя",
  })
  async updateUser(@Args("input") input: UpdateUserInput) {
    const { id, ...data } = input;
    return this.usersService.update(id, data);
  }
}
