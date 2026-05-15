import {
  Resolver,
  Query,
  Args,
  ID,
  Int,
  ResolveField,
  Parent,
} from "@nestjs/graphql";
import { TrainerType } from "../types/trainer.type";
import { TrainersService } from "../../modules/trainers/trainers.service";
import { Trainer } from "../../entities";
import { Public } from "../../common/decorators/public.decorator";

@Resolver(() => TrainerType)
export class TrainerResolver {
  constructor(private readonly trainersService: TrainersService) {}

  @Query(() => [TrainerType], {
    name: "trainers",
    description: "Получить список тренеров",
  })
  @Public()
  async getTrainers() {
    return this.trainersService.findAll();
  }

  @Query(() => TrainerType, {
    name: "trainer",
    description: "Получить тренера по ID",
  })
  @Public()
  async getTrainer(@Args("id", { type: () => ID }) id: string) {
    return this.trainersService.findOne(id);
  }

  @Query(() => [TrainerType], {
    name: "topRatedTrainers",
    description: "Получить топ тренеров по рейтингу",
  })
  @Public()
  async getTopRated(
    @Args("limit", { type: () => Int, nullable: true, defaultValue: 5 })
    limit: number,
  ) {
    return this.trainersService.getTopRated(limit);
  }

  @Query(() => [TrainerType], {
    name: "trainersBySpecialty",
    description: "Найти тренеров по специализации",
  })
  @Public()
  async getBySpecialty(@Args("specialty") specialty: string) {
    return this.trainersService.findBySpecialty(specialty);
  }

  @ResolveField(() => String, { name: "name" })
  getName(@Parent() trainer: Trainer): string | undefined {
    return trainer.user?.name;
  }

  @ResolveField(() => String, { name: "photoUrl", nullable: true })
  getPhotoUrl(@Parent() trainer: Trainer): string | undefined {
    return trainer.user?.photoUrl;
  }
}
