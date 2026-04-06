import { Resolver, Query, Args, ID } from "@nestjs/graphql";
import { TariffObjectType } from "../types/tariff.type";
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
}
