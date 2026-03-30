import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "../../entities";
import { UserRole } from "../../common/enums/user-roles.enum";

@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: "Создать нового пользователя" })
  @ApiResponse({
    status: 201,
    description: "Пользователь успешно создан",
    type: User,
  })
  @ApiResponse({ status: 400, description: "Некорректные данные" })
  @ApiResponse({ status: 409, description: "Email или телефон уже занят" })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: "Получить список пользователей" })
  @ApiResponse({ status: 200, description: "Список пользователей" })
  @ApiQuery({ name: "role", required: false, enum: UserRole })
  @ApiQuery({ name: "isActive", required: false, type: Boolean })
  async findAll(
    @Query("role") role?: UserRole,
    @Query("isActive") isActive?: string,
  ): Promise<User[]> {
    const filters: { role?: UserRole; isActive?: boolean } = {};
    if (role) filters.role = role;
    if (isActive !== undefined) filters.isActive = isActive === "true";

    return await this.usersService.findAll(filters);
  }

  @Get("email/:email")
  @ApiOperation({ summary: "Найти пользователя по email" })
  @ApiParam({ name: "email", description: "Email пользователя" })
  @ApiResponse({
    status: 200,
    description: "Пользователь найден",
    type: User,
  })
  @ApiResponse({ status: 404, description: "Пользователь не найден" })
  async findByEmail(@Param("email") email: string): Promise<User | null> {
    return await this.usersService.findByEmail(email);
  }

  @Get("role/:role")
  @ApiOperation({ summary: "Получить пользователей по роли" })
  @ApiParam({ name: "role", description: "Роль пользователя", enum: UserRole })
  @ApiResponse({
    status: 200,
    description: "Список пользователей",
    type: [User],
  })
  async findByRole(@Param("role") role: UserRole): Promise<User[]> {
    return await this.usersService.findByRole(role);
  }

  @Get(":id")
  @ApiOperation({ summary: "Получить пользователя по ID" })
  @ApiParam({ name: "id", description: "UUID пользователя" })
  @ApiResponse({
    status: 200,
    description: "Пользователь найден",
    type: User,
  })
  @ApiResponse({ status: 404, description: "Пользователь не найден" })
  async findOne(@Param("id", ParseUUIDPipe) id: string): Promise<User> {
    return await this.usersService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Обновить данные пользователя" })
  @ApiParam({ name: "id", description: "UUID пользователя" })
  @ApiResponse({
    status: 200,
    description: "Пользователь успешно обновлён",
    type: User,
  })
  @ApiResponse({ status: 404, description: "Пользователь не найден" })
  @ApiResponse({ status: 409, description: "Email или телефон уже занят" })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return await this.usersService.update(id, updateUserDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Деактивировать пользователя" })
  @ApiParam({ name: "id", description: "UUID пользователя" })
  @ApiResponse({ status: 204, description: "Пользователь деактивирован" })
  @ApiResponse({ status: 404, description: "Пользователь не найден" })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    return await this.usersService.remove(id);
  }

  @Delete(":id/hard")
  @ApiOperation({ summary: "Полностью удалить пользователя (для админа)" })
  @ApiParam({ name: "id", description: "UUID пользователя" })
  @ApiResponse({ status: 204, description: "Пользователь удалён" })
  @ApiResponse({ status: 404, description: "Пользователь не найден" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  async hardDelete(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    return await this.usersService.hardDelete(id);
  }
}
