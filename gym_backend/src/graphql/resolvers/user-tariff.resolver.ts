import { Resolver, Query, Args, ID } from "@nestjs/graphql";
import { UserTariffType } from "../types/user-tariff.type";
import { AssignTariffService } from "../../modules/user-tariff/assign-tariff.service";

@Resolver(() => UserTariffType)
export class UserTariffResolver {
  constructor(private readonly assignTariffService: AssignTariffService) {}

  @Query(() => [UserTariffType], {
    name: "userTariffs",
    description: "Получить подписки пользователя",
  })
  async getUserTariffs(@Args("userId", { type: () => ID }) userId: string) {
    return this.assignTariffService.findByUser(userId);
  }

  @Query(() => UserTariffType, {
    name: "activeUserTariff",
    description: "Получить активную подписку пользователя",
    nullable: true,
  })
  async getActiveTariff(@Args("userId", { type: () => ID }) userId: string) {
    return this.assignTariffService.getActiveTariff(userId);
  }

  @Query(() => UserTariffType, {
    name: "userTariff",
    description: "Получить подписку по ID",
  })
  async getUserTariff(@Args("id", { type: () => ID }) id: string) {
    return this.assignTariffService.findOne(id);
  }
}
