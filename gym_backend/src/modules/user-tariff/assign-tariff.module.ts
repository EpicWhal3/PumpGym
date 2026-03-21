import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Tariff, User, UserTariff } from "../../entities";
import { AssignTariffService } from "./assign-tariff.service";

@Module({
  imports: [TypeOrmModule.forFeature([UserTariff, Tariff, User])],
  providers: [AssignTariffService],
  exports: [AssignTariffService],
})
export class AssignTariffModule {}
