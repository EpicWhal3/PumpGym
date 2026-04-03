import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TerminusModule } from "@nestjs/terminus";
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
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { GraphqlModule } from "./graphql/graphql.module";

@Module({
  imports: [
    TerminusModule,
    BookingsModule,
    EnrollmentsModule,
    TrainersModule,
    TariffsModule,
    TimetableModule,
    AssignTariffModule,
    UsersModule,
    GraphqlModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: "../.env",
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
    }),
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
