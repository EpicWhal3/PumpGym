import { Module } from "@nestjs/common";
import { registerEnumType } from "@nestjs/graphql";

import {
  UserResolver,
  TrainerResolver,
  TariffResolver,
  UserTariffResolver,
  TimetableResolver,
  BookingResolver,
  EnrollmentResolver,
} from "./resolvers";

import { UsersModule } from "../modules/users/users.module";
import { TrainersModule } from "../modules/trainers/trainers.module";
import { TariffsModule } from "../modules/tariffs/tariff.module";
import { AssignTariffModule } from "../modules/user-tariff/assign-tariff.module";
import { TimetableModule } from "../modules/timetable/timetable.module";
import { BookingsModule } from "../modules/bookings/bookings.module";
import { EnrollmentsModule } from "../modules/enrollments/enrollment.module";

import { WorkoutType } from "../common/enums/workout-types.enum";
import { EntryStatus } from "../common/enums/entry-status.enum";
import { BookingStatus } from "../common/enums/booking-status.enum";
import { ServiceType } from "../common/enums/service-types.enum";
import { EnrollmentStatus } from "../common/enums/enrollments-status.enum";
import { UserRole } from "../common/enums/user-roles.enum";
import { TariffType } from "../common/enums/tariff-types.enum";
import { TariffState } from "../common/enums/tariff-status.enum";
import { AuthModule } from "../modules/auth/auth.module";
import { AuthResolver } from "./resolvers";

registerEnumType(WorkoutType, { name: "WorkoutType" });
registerEnumType(EntryStatus, { name: "EntryStatus" });
registerEnumType(BookingStatus, { name: "BookingStatus" });
registerEnumType(ServiceType, { name: "ServiceType" });
registerEnumType(EnrollmentStatus, { name: "EnrollmentStatus" });
registerEnumType(UserRole, { name: "UserRole" });
registerEnumType(TariffType, { name: "TariffType" });
registerEnumType(TariffState, { name: "TariffState" });

@Module({
  imports: [
    AuthModule,
    UsersModule,
    TrainersModule,
    TariffsModule,
    AssignTariffModule,
    TimetableModule,
    BookingsModule,
    EnrollmentsModule,
  ],
  providers: [
    AuthResolver,
    UserResolver,
    TrainerResolver,
    TariffResolver,
    UserTariffResolver,
    TimetableResolver,
    BookingResolver,
    EnrollmentResolver,
  ],
})
export class GraphqlModule {}
