import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { CacheModule } from "@nestjs/cache-manager";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TerminusModule } from "@nestjs/terminus";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { HealthController } from "./health/health.controller";

import {
  User,
  Trainer,
  Tariff,
  UserTariff,
  TimetableEntry,
  Booking,
  ClassEnrollment,
} from "./entities";
import { BookingsModule } from "./modules/bookings/bookings.module";
import { EnrollmentsModule } from "./modules/enrollments/enrollment.module";
import { AssignTariffModule } from "./modules/user-tariff/assign-tariff.module";
import { TrainersModule } from "./modules/trainers/trainers.module";
import { TariffsModule } from "./modules/tariffs/tariff.module";
import { TimetableModule } from "./modules/timetable/timetable.module";
import { UsersModule } from "./modules/users/users.module";
import { GraphqlModule } from "./graphql/graphql.module";
import { AuthModule } from "./modules/auth/auth.module";
import { BffModule } from "./modules/bff/bff.module";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { RolesGuard } from "./common/guards/roles.guard";

@Module({
  imports: [
    TerminusModule,
    CacheModule.register({ isGlobal: true, ttl: 60_000, max: 500 }),
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get("DB_HOST"),
        port: configService.get<number>("DB_PORT"),
        username: configService.get("DB_USER"),
        password: configService.get("DB_PASSWORD"),
        database: configService.get("DB_NAME"),
        entities: [
          User,
          Trainer,
          Tariff,
          UserTariff,
          TimetableEntry,
          Booking,
          ClassEnrollment,
        ],
        synchronize: true,
        logging: configService.get("NODE_ENV") === "development",
      }),
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      sortSchema: true,
      playground: true,
      context: ({ req }) => ({ req }),
    }),
    AuthModule,
    BffModule,
    BookingsModule,
    EnrollmentsModule,
    TrainersModule,
    TariffsModule,
    TimetableModule,
    AssignTariffModule,
    UsersModule,
    GraphqlModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
