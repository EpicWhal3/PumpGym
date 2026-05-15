import { Args, ID, Query, Resolver } from "@nestjs/graphql";
import { UserTariffType } from "../types/user-tariff.type";
import { AssignTariffService } from "../../modules/user-tariff/assign-tariff.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { UserRole } from "../../common/enums/user-roles.enum";

@Resolver(() => UserTariffType)
export class UserTariffResolver {
  constructor(private readonly assignTariffService: AssignTariffService) {}

  @Query(() => [UserTariffType], {
    name: "userTariffs",
    description: "Получить подписки пользователя",
  })
  @Roles(UserRole.ADMIN, UserRole.USER)
  async getUserTariffs(@Args("userId", { type: () => ID }) userId: string) {
    return this.assignTariffService.findByUser(userId);
  }

  @Query(() => UserTariffType, {
    name: "activeUserTariff",
    description: "Получить активную подписку пользователя",
    nullable: true,
  })
  @Roles(UserRole.ADMIN, UserRole.USER)
  async getActiveTariff(@Args("userId", { type: () => ID }) userId: string) {
    return this.assignTariffService.getActiveTariff(userId);
  }

  @Query(() => UserTariffType, {
    name: "userTariff",
    description: "Получить подписку по ID",
  })
  @Roles(UserRole.ADMIN, UserRole.USER)
  async getUserTariff(@Args("id", { type: () => ID }) id: string) {
    return this.assignTariffService.findOne(id);
  }
}
