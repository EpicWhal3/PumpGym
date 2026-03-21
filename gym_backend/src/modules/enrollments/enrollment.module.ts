import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  ClassEnrollment,
  TimetableEntry,
  User,
  UserTariff,
} from "../../entities";
import { EnrollmentService } from "./enrollment.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClassEnrollment,
      TimetableEntry,
      User,
      UserTariff,
    ]),
  ],
  providers: [EnrollmentService],
  exports: [EnrollmentService],
})
export class EnrollmentModule {}
