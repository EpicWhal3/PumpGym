import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import { TariffObjectType } from "../types/tariff.type";
import {
  CreateTariffInput,
  UpdateTariffInput,
} from "../inputs";
import { TariffsService } from "../../modules/tariffs/tariff.service";

@Resolver(() => TariffObjectType)
export class TariffResolver {
  constructor(private readonly tariffsService: TariffsService) {}

  @Query(() => [TariffObjectType], {
    name: "tariffs",
    description: "Получить список тарифов",
  })
  async getTariffs(
    @Args("activeOnly", { nullable: true, defaultValue: true })
    activeOnly: boolean,
  ) {
    return this.tariffsService.findAll(activeOnly);
  }

  @Query(() => TariffObjectType, {
    name: "tariff",
    description: "Получить тариф по ID",
  })
  async getTariff(@Args("id", { type: () => ID }) id: string) {
    return this.tariffsService.findOne(id);
  }

  @Mutation(() => TariffObjectType, {
    name: "createTariff",
    description: "Создать тариф",
  })
  async createTariff(@Args("input") input: CreateTariffInput) {
    return this.tariffsService.create(input);
  }

  @Mutation(() => TariffObjectType, {
    name: "updateTariff",
    description: "Обновить тариф",
  })
  async updateTariff(@Args("input") input: UpdateTariffInput) {
    const { id, ...data } = input;
    return this.tariffsService.update(id, data);
  }

  @Mutation(() => Boolean, {
    name: "deactivateTariff",
    description: "Деактивировать тариф (мягкое удаление)",
  })
  async deactivateTariff(
    @Args("id", { type: () => ID }) id: string,
  ): Promise<boolean> {
    await this.tariffsService.remove(id);
    return true;
  }
}
