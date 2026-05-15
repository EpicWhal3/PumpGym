import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TimetableController } from "./timetable.controller";
import { TimetableService } from "./timetable.service";
import { TimetableEntry, Trainer } from "../../entities";

@Module({
  imports: [TypeOrmModule.forFeature([TimetableEntry, Trainer])],
  controllers: [TimetableController],
  providers: [TimetableService],
  exports: [TimetableService],
})
export class TimetableModule {}
