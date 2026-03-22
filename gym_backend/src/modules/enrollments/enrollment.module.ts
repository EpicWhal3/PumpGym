import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  ClassEnrollment,
  TimetableEntry,
  User,
  UserTariff,
} from "../../entities";
import { EnrollmentService } from "./enrollment.service";
import { EnrollmentController } from "./enrollment.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClassEnrollment,
      TimetableEntry,
      User,
      UserTariff,
    ]),
  ],
  controllers: [EnrollmentController],
  providers: [EnrollmentService],
  exports: [EnrollmentService],
})
export class EnrollmentsModule {}
