import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Trainer, User } from "../../entities";
import { CreateTrainerDto } from "./dto/create-trainer.dto";
import { UpdateTrainerDto } from "./dto/update-trainer.dto";
import { UserRole } from "../../common/enums/user-roles.enum";
import { UsersService } from "../users/users.service";

@Injectable()
export class TrainersService {
  constructor(
    @InjectRepository(Trainer)
    private trainersRepository: Repository<Trainer>,
    private usersService: UsersService,
  ) {}

  async create(dto: CreateTrainerDto): Promise<Trainer> {
    let user: User;

    if (dto.userId) {
      user = await this.usersService.findOne(dto.userId);

      if (user.trainer) {
        throw new ConflictException("Пользователь уже является тренером");
      }

      await this.usersService.update(user.id, {
        role: UserRole.TRAINER,
        photoUrl: dto.photoUrl ?? user.photoUrl,
      });

      user = await this.usersService.findOne(user.id);
    } else {
      user = await this.usersService.create({
        name: dto.name!,
        email: dto.email!,
        phone: dto.phone!,
        password: dto.password!,
        role: UserRole.TRAINER,
        photoUrl: dto.photoUrl,
      });
    }

    const trainer = this.trainersRepository.create({
      userId: user.id,
      user,
      specialty: dto.specialty,
      experience: dto.experience,
      bio: dto.bio,
      rating: dto.rating,
      reviews: dto.reviews ?? 0,
      isActive: dto.isActive ?? true,
    });

    return await this.trainersRepository.save(trainer);
  }

  async findAll(): Promise<Trainer[]> {
    return await this.trainersRepository.find({
      where: { isActive: true },
      relations: ["user"],
      order: { rating: "DESC", reviews: "DESC" },
    });
  }

  async findOne(id: string): Promise<Trainer> {
    const trainer = await this.trainersRepository.findOne({
      where: { id, isActive: true },
      relations: ["user", "timetableEntries"],
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
