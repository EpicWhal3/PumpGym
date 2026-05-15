import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "../../entities";
import { UserRole } from "../../common/enums/user-roles.enum";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/interfaces/authenticated-user.interface";
import { extname, join } from "node:path";
import { rename } from "node:fs/promises";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { FileInterceptor } from "@nestjs/platform-express";

@ApiTags("users")
@Controller("users")
@ApiBearerAuth("JWT-auth")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Создать нового пользователя (admin only)" })
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
  @Roles(UserRole.ADMIN)
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
  @Roles(UserRole.ADMIN)
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
  @Roles(UserRole.ADMIN)
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
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.TRAINER)
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

  @Get("me")
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.TRAINER)
  @ApiOperation({ summary: "Получить текущий профиль" })
  @ApiResponse({
    status: 200,
    description: "Текущий пользователь",
    type: User,
  })
  async getMe(@CurrentUser() user: AuthenticatedUser): Promise<User> {
    return await this.usersService.findOne(user.id);
  }

  @Patch("me")
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.TRAINER)
  @ApiOperation({ summary: "Обновить текущий профиль" })
  @ApiResponse({
    status: 200,
    description: "Профиль обновлён",
    type: User,
  })
  @ApiResponse({ status: 409, description: "Email или телефон уже занят" })
  async updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    return await this.usersService.updateProfile(user.id, updateProfileDto);
  }

  @Post("me/photo")
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.TRAINER)
  @UseInterceptors(
    FileInterceptor("photo", {
      dest: "uploads/avatars",
      limits: { fileSize: 2 * 1024 * 1024 },
      fileFilter: (_req, file, callback) => {
        const isImage = ["image/jpeg", "image/png", "image/webp"].includes(
          file.mimetype,
        );

        callback(
          isImage
            ? null
            : new BadRequestException("Поддерживаются только JPG, PNG и WEBP"),
          isImage,
        );
      },
    }),
  )
  @ApiOperation({ summary: "Загрузить фото текущего профиля" })
  @ApiResponse({
    status: 200,
    description: "Фото профиля обновлено",
    type: User,
  })
  async uploadMyPhoto(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: any,
  ): Promise<User> {
    if (!file) {
      throw new BadRequestException("Файл photo обязателен");
    }

    const ext = extname(file.originalname).toLowerCase();
    const filename = `${file.filename}${ext}`;

    await rename(file.path, join(file.destination, filename));

    return await this.usersService.updatePhotoUrl(
      user.id,
      `/uploads/avatars/${filename}`,
    );
  }

  @Patch(":id")
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.TRAINER)
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
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Деактивировать пользователя" })
  @ApiParam({ name: "id", description: "UUID пользователя" })
  @ApiResponse({ status: 204, description: "Пользователь деактивирован" })
  @ApiResponse({ status: 404, description: "Пользователь не найден" })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    return await this.usersService.remove(id);
  }

  @Delete(":id/hard")
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Полностью удалить пользователя (для админа)" })
  @ApiParam({ name: "id", description: "UUID пользователя" })
  @ApiResponse({ status: 204, description: "Пользователь удалён" })
  @ApiResponse({ status: 404, description: "Пользователь не найден" })
  @HttpCode(HttpStatus.NO_CONTENT)
  async surge(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    return await this.usersService.surge(id);
  }
}
