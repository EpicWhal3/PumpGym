import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { EnrollmentService } from "./enrollment.service";
import { CreateEnrollmentDto } from "./dto/create-enrollment.dto";
import { ClassEnrollment } from "../../entities";
import { Roles } from "../../common/decorators/roles.decorator";
import { UserRole } from "../../common/enums/user-roles.enum";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { type AuthenticatedUser } from "../../common/interfaces/authenticated-user.interface";

@ApiTags("enrollments")
@Controller("enrollments")
@ApiBearerAuth("JWT-auth")
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post()
  @Roles(UserRole.USER, UserRole.TRAINER)
  @ApiOperation({ summary: "Записаться на занятие" })
  @ApiResponse({
    status: 201,
    description: "Запись успешно создана",
    type: ClassEnrollment,
  })
  @ApiResponse({
    status: 400,
    description: "Нет мест или нет действующего тарифа",
  })
  @ApiResponse({
    status: 404,
    description: "Пользователь или занятие не найдены",
  })
  async create(
    @Body() createEnrollmentDto: CreateEnrollmentDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ClassEnrollment> {
    return await this.enrollmentService.enrollUser(
      createEnrollmentDto,
      currentUser,
    );
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TRAINER, UserRole.USER)
  @ApiOperation({ summary: "Получить список записей" })
  @ApiResponse({
    status: 200,
    description: "Список записей",
    type: [ClassEnrollment],
  })
  @ApiQuery({
    name: "userId",
    required: false,
    description: "Фильтр по пользователю",
  })
  @ApiQuery({
    name: "entryId",
    required: false,
    description: "Фильтр по занятию",
  })
  async findAll(
    @Query() filters: { userId?: string; entryId?: string },
  ): Promise<ClassEnrollment[]> {
    if (filters.userId) {
      return await this.enrollmentService.findByUser(filters.userId);
    }
    if (filters.entryId) {
      return await this.enrollmentService.findByTimetableEntry(filters.entryId);
    }
    return await this.enrollmentService.findAll();
  }

  @Get(":id")
  @Roles(UserRole.ADMIN, UserRole.TRAINER, UserRole.USER)
  @ApiOperation({ summary: "Получить запись по ID" })
  @ApiParam({ name: "id", description: "UUID записи" })
  @ApiResponse({
    status: 200,
    description: "Запись найдена",
    type: ClassEnrollment,
  })
  @ApiResponse({ status: 404, description: "Запись не найдена" })
  async findOne(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<ClassEnrollment> {
    return await this.enrollmentService.findOne(id);
  }

  @Delete(":id")
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: "Отменить запись на занятие" })
  @ApiParam({ name: "id", description: "UUID записи" })
  @ApiQuery({
    name: "userId",
    required: true,
    description: "UUID пользователя",
  })
  @ApiResponse({ status: 204, description: "Запись отменена" })
  @ApiResponse({ status: 400, description: "Нельзя отменить" })
  @ApiResponse({ status: 404, description: "Запись не найдена" })
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancel(
    @Param("id", ParseUUIDPipe) id: string,
    @Query("userId", ParseUUIDPipe) userId: string,
  ): Promise<void> {
    return await this.enrollmentService.cancelEnrollment(userId, id);
  }

  @Post(":id/attend")
  @Roles(UserRole.TRAINER, UserRole.ADMIN)
  @ApiOperation({ summary: "Отметить посещение (для тренера)" })
  @ApiParam({ name: "id", description: "UUID записи" })
  @ApiResponse({
    status: 200,
    description: "Посещение отмечено",
    type: ClassEnrollment,
  })
  @ApiResponse({ status: 404, description: "Запись не найдена" })
  async markAttended(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<ClassEnrollment> {
    return await this.enrollmentService.markAttended(id);
  }
}
