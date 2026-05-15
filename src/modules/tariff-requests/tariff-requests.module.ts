import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Tariff, TariffRequest, User } from "../../entities";
import { TariffRequestsController } from "./tariff-requests.controller";
import { TariffRequestsService } from "./tariff-requests.service";
import { AssignTariffModule } from "../user-tariff/assign-tariff.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([TariffRequest, Tariff, User]),
    AssignTariffModule,
  ],
  controllers: [TariffRequestsController],
  providers: [TariffRequestsService],
  exports: [TariffRequestsService],
})
export class TariffRequestsModule {}
