import { Module } from "@nestjs/common";

import { TypeOrmModule } from "@nestjs/typeorm";
import { TrainersController } from "./trainers.controller";
import { TrainersService } from "./trainers.service";
import { Trainer } from "../../entities";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [TypeOrmModule.forFeature([Trainer]), UsersModule],
  controllers: [TrainersController],
  providers: [TrainersService],
  exports: [TrainersService],
})
export class TrainersModule {}
