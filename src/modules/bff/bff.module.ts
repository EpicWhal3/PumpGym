import { Module } from "@nestjs/common";
import { BffController } from "./bff.controller";
import { BffService } from "./bff.service";
import { TimetableModule } from "../timetable/timetable.module";

@Module({
  imports: [TimetableModule],
  controllers: [BffController],
  providers: [BffService],
  exports: [BffService],
})
export class BffModule {}
