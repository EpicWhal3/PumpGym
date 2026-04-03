import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TariffController } from "./tariff.controller";
import { TariffsService } from "./tariff.service";
import { Tariff } from "../../entities";

@Module({
  imports: [TypeOrmModule.forFeature([Tariff])],
  controllers: [TariffController],
  providers: [TariffsService],
  exports: [TariffsService],
})
export class TariffsModule {}
