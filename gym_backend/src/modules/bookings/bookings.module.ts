import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Booking, User } from "../../entities";
import { BookingsService } from "./bookings.service";
import { BookingsController } from "./bookings.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Booking, User])],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
