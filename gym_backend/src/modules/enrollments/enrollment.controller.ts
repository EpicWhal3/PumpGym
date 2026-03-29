import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
  HttpCode,
  HttpStatus,
  Body,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { EnrollmentService } from "./enrollment.service";
import { CreateEnrollmentDto } from "./dto/create-enrollment.dto";
import { ClassEnrollment } from "../../entities";

@ApiTags("enrollments")
@Controller("enrollments")
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post()
  @ApiOperation({ summary: "Записаться на занятие" })
  @ApiResponse({
    status: 201,
    description: "Запись успешно создана",
    type: ClassEnrollment,
  })
  @ApiResponse({ status: 400, description: "Нет мест или нет подписки" })
  @ApiResponse({
    status: 404,
    description: "Пользователь или занятие не найдены",
  })
  @ApiBearerAuth()
  async create(
    @Body() createEnrollmentDto: CreateEnrollmentDto,
  ): Promise<ClassEnrollment> {
    return await this.enrollmentService.enrollUser(createEnrollmentDto);
  }

  @Get()
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
  @ApiBearerAuth()
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
  @ApiBearerAuth()
  async cancel(
    @Param("id", ParseUUIDPipe) id: string,
    @Query("userId", ParseUUIDPipe) userId: string,
  ): Promise<void> {
    return await this.enrollmentService.cancelEnrollment(userId, id);
  }

  @Post(":id/attend")
  @ApiOperation({ summary: "Отметить посещение (для тренера)" })
  @ApiParam({ name: "id", description: "UUID записи" })
  @ApiResponse({
    status: 200,
    description: "Посещение отмечено",
    type: ClassEnrollment,
  })
  @ApiResponse({ status: 404, description: "Запись не найдена" })
  @ApiBearerAuth()
  async markAttended(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<ClassEnrollment> {
    return await this.enrollmentService.markAttended(id);
  }
}
