import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Booking, User } from "../../entities";
import { BookingsService } from "./bookings.service";

@Module({
  imports: [TypeOrmModule.forFeature([Booking, User])],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
