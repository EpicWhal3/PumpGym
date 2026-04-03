import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import { UserTariffType } from "../types/user-tariff.type";
import { AssignTariffInput } from "../inputs";
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

  @Mutation(() => UserTariffType, {
    name: "assignTariff",
    description: "Назначить тариф пользователю",
  })
  async assignTariff(@Args("input") input: AssignTariffInput) {
    return this.assignTariffService.assignTariff(input);
  }

  @Mutation(() => UserTariffType, {
    name: "renewTariff",
    description: "Продлить подписку",
  })
  async renewTariff(
    @Args("userId", { type: () => ID }) userId: string,
    @Args("tariffId", { type: () => ID }) tariffId: string,
  ) {
    return this.assignTariffService.renewTariff(userId, tariffId);
  }

  @Mutation(() => UserTariffType, {
    name: "suspendTariff",
    description: "Заморозить подписку",
  })
  async suspendTariff(@Args("id", { type: () => ID }) id: string) {
    return this.assignTariffService.suspendTariff(id);
  }

  @Mutation(() => UserTariffType, {
    name: "activateTariff",
    description: "Разморозить подписку",
  })
  async activateTariff(@Args("id", { type: () => ID }) id: string) {
    return this.assignTariffService.activateTariff(id);
  }

  @Mutation(() => Boolean, {
    name: "cancelUserTariff",
    description: "Отменить подписку",
  })
  async cancelTariff(
    @Args("id", { type: () => ID }) id: string,
  ): Promise<boolean> {
    await this.assignTariffService.remove(id);
    return true;
  }
}
