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
      role: createUserDto.role ?? UserRole.USER,
      isActive: createUserDto.isActive ?? true,
    });

    return await this.usersRepository.save(user);
  }

  async findAll(filters?: {
    role?: UserRole;
    isActive?: boolean;
  }): Promise<User[]> {
    const where: Record<string, unknown> = {};

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
        "role",
        "photoUrl",
        "isActive",
        "registrationDate",
      ],
      relations: ["trainer", "tariffs", "bookings", "enrollments"],
    });

    if (!user) {
      throw new NotFoundException(`Пользователь с ID "${id}" не найден`);
    }

    return user;
  }

  async findAuthUserById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id, isActive: true },
      select: [
        "id",
        "name",
        "email",
        "phone",
        "role",
        "password",
        "photoUrl",
        "isActive",
        "registrationDate",
      ],
    });

    if (!user) {
      throw new NotFoundException(`Пользователь с ID "${id}" не найден`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { email },
      select: ["id", "name", "email", "role", "phone", "isActive"],
    });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { email, isActive: true },
      select: [
        "id",
        "name",
        "email",
        "phone",
        "role",
        "password",
        "photoUrl",
        "isActive",
        "registrationDate",
      ],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const authUser = await this.findAuthUserById(id);

    if (updateUserDto.email && updateUserDto.email !== authUser.email) {
      const existing = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existing) {
        throw new ConflictException(
          `Пользователь с email "${updateUserDto.email}" уже существует`,
        );
      }
    }

    if (updateUserDto.phone && updateUserDto.phone !== authUser.phone) {
      const existing = await this.usersRepository.findOne({
        where: { phone: updateUserDto.phone },
      });
      if (existing) {
        throw new ConflictException(
          `Пользователь с телефоном "${updateUserDto.phone}" уже существует`,
        );
      }
    }

    Object.assign(authUser, updateUserDto);
    await this.usersRepository.save(authUser);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findAuthUserById(id);
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
      select: ["id", "name", "email", "phone", "photoUrl", "role"],
    });
  }
}
