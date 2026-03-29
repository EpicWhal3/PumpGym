import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Tariff, User, UserTariff } from "../../entities";
import { AssignTariffService } from "./assign-tariff.service";
import { UserTariffController } from "./user-tariff.controller";

@Module({
  imports: [TypeOrmModule.forFeature([UserTariff, Tariff, User])],
  controllers: [UserTariffController],
  providers: [AssignTariffService],
})
export class AssignTariffModule {}
