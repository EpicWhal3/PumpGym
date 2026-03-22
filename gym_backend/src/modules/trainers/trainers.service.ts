import {
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Trainer } from "../../entities";
import { CreateTrainerDto } from "./dto/create-trainer.dto";
import { UpdateTrainerDto } from "./dto/update-trainer.dto";
import { PaginationDto } from "../../common/dto/pagination.dto";

@Injectable()
export class TrainersService {
  constructor(
    @InjectRepository(Trainer)
    private trainersRepository: Repository<Trainer>,
  ) {}

  async create(createTrainerDto: CreateTrainerDto): Promise<Trainer> {
    const trainer = this.trainersRepository.create(createTrainerDto);
    return await this.trainersRepository.save(trainer);
  }

  async findAll(pagination?: PaginationDto): Promise<Trainer[]> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 10;

    return await this.trainersRepository.find({
      where: { isActive: true },
      order: { rating: "DESC", reviews: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findOne(id: string): Promise<Trainer> {
    const trainer = await this.trainersRepository.findOne({
      where: { id, isActive: true },
      relations: ["timetableEntries"],
    });

    if (!trainer) {
      throw new NotFoundException(`Тренер с ID "${id}" не найден`);
    }

    return trainer;
  }

  async update(
    id: string,
    updateTrainerDto: UpdateTrainerDto,
  ): Promise<Trainer> {
    const trainer = await this.findOne(id);

    Object.assign(trainer, updateTrainerDto);

    return await this.trainersRepository.save(trainer);
  }

  async remove(id: string): Promise<void> {
    const trainer = await this.findOne(id);

    trainer.isActive = false;
    await this.trainersRepository.save(trainer);
  }

  async hardDelete(id: string): Promise<void> {
    const result = await this.trainersRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Тренер с ID "${id}" не найден`);
    }
  }

  async findBySpecialty(specialty: string): Promise<Trainer[]> {
    return await this.trainersRepository
      .createQueryBuilder("trainer")
      .where("trainer.isActive = :isActive", { isActive: true })
      .andWhere("trainer.specialty LIKE :specialty", {
        specialty: `%${specialty}%`,
      })
      .orderBy("trainer.rating", "DESC")
      .getMany();
  }

  async getTopRated(limit: number = 5): Promise<Trainer[]> {
    return await this.trainersRepository.find({
      where: { isActive: true },
      order: { rating: "DESC" },
      take: limit,
    });
  }
}
