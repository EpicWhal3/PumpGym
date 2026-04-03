import { Resolver, Query, Mutation, Args, ID, Int } from "@nestjs/graphql";
import { TrainerType } from "../types/trainer.type";
import {
  CreateTrainerInput,
  UpdateTrainerInput,
} from "../inputs";
import { TrainersService } from "../../modules/trainers/trainers.service";

@Resolver(() => TrainerType)
export class TrainerResolver {
  constructor(private readonly trainersService: TrainersService) {}

  @Query(() => [TrainerType], {
    name: "trainers",
    description: "Получить список тренеров",
  })
  async getTrainers() {
    return this.trainersService.findAll();
  }

  @Query(() => TrainerType, {
    name: "trainer",
    description: "Получить тренера по ID",
  })
  async getTrainer(@Args("id", { type: () => ID }) id: string) {
    return this.trainersService.findOne(id);
  }

  @Query(() => [TrainerType], {
    name: "topRatedTrainers",
    description: "Получить топ тренеров по рейтингу",
  })
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
  async getBySpecialty(@Args("specialty") specialty: string) {
    return this.trainersService.findBySpecialty(specialty);
  }

  @Mutation(() => TrainerType, {
    name: "createTrainer",
    description: "Создать тренера",
  })
  async createTrainer(@Args("input") input: CreateTrainerInput) {
    return this.trainersService.create(input);
  }

  @Mutation(() => TrainerType, {
    name: "updateTrainer",
    description: "Обновить тренера",
  })
  async updateTrainer(@Args("input") input: UpdateTrainerInput) {
    const { id, ...data } = input;
    return this.trainersService.update(id, data);
  }

  @Mutation(() => Boolean, {
    name: "deactivateTrainer",
    description: "Деактивировать тренера (мягкое удаление)",
  })
  async deactivateTrainer(
    @Args("id", { type: () => ID }) id: string,
  ): Promise<boolean> {
    await this.trainersService.remove(id);
    return true;
  }
}
