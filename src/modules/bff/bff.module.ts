import { Module } from "@nestjs/common";
import { BffController } from "./bff.controller";
import { BffService } from "./bff.service";
import { TimetableModule } from "../timetable/timetable.module";
import { EnrollmentsModule } from "../enrollments/enrollment.module";
import { AssignTariffModule } from "../user-tariff/assign-tariff.module";
import { TariffsModule } from "../tariffs/tariff.module";
import { TrainersModule } from "../trainers/trainers.module";
import { BookingsModule } from "../bookings/bookings.module";
import { UsersModule } from "../users/users.module";
import { AuthModule } from "../auth/auth.module";
import { TariffRequestsModule } from "../tariff-requests/tariff-requests.module";

@Module({
  imports: [
    AuthModule,
    UsersModule,
    TimetableModule,
    EnrollmentsModule,
    AssignTariffModule,
    TariffsModule,
    TrainersModule,
    BookingsModule,
    TariffRequestsModule,
  ],
  controllers: [BffController],
  providers: [BffService],
  exports: [BffService],
})
export class BffModule {}
