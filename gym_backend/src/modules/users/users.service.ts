import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../../entities";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserRole } from "../../common/enums/user-roles.enum";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingEmail = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingEmail) {
      throw new ConflictException(
        `Пользователь с email "${createUserDto.email}" уже существует`,
      );
    }

    const existingPhone = await this.usersRepository.findOne({
      where: { phone: createUserDto.phone },
    });
    if (existingPhone) {
      throw new ConflictException(
        `Пользователь с телефоном "${createUserDto.phone}" уже существует`,
      );
    }

    const user = this.usersRepository.create({
      ...createUserDto,
      role: createUserDto.role ?? UserRole.CLIENT,
      isActive: createUserDto.isActive ?? true,
    });

    return await this.usersRepository.save(user);
  }

  async findAll(filters?: {
    role?: UserRole;
    isActive?: boolean;
  }): Promise<User[]> {
    const where: any = {};

    if (filters?.role) {
      where.role = filters.role;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    return await this.usersRepository.find({
      where,
      select: [
        "id",
        "name",
        "email",
        "phone",
        "role",
        "photoUrl",
        "isActive",
        "registrationDate",
      ],
      order: { registrationDate: "DESC" },
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: [
        "id",
        "name",
        "email",
        "phone",
        "photoUrl",
        "isActive",
        "registrationDate",
      ],
      relations: ["tariffs", "bookings", "enrollments"],
    });

    if (!user) {
      throw new NotFoundException(`Пользователь с ID "${id}" не найден`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { email },
      select: ["id", "name", "email", "phone", "isActive"],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existing = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existing) {
        throw new ConflictException(
          `Пользователь с email "${updateUserDto.email}" уже существует`,
        );
      }
    }

    if (updateUserDto.phone && updateUserDto.phone !== user.phone) {
      const existing = await this.usersRepository.findOne({
        where: { phone: updateUserDto.phone },
      });
      if (existing) {
        throw new ConflictException(
          `Пользователь с телефоном "${updateUserDto.phone}" уже существует`,
        );
      }
    }

    if (updateUserDto.password) {
      user.password = updateUserDto.password;
      delete updateUserDto.password;
    }

    Object.assign(user, updateUserDto);
    return await this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    user.isActive = false;
    await this.usersRepository.save(user);
  }

  async surge(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Пользователь с ID "${id}" не найден`);
    }
  }

  async findByRole(role: UserRole): Promise<User[]> {
    return await this.usersRepository.find({
      where: { role, isActive: true },
      select: ["id", "name", "email", "phone", "photoUrl"],
    });
  }
}
