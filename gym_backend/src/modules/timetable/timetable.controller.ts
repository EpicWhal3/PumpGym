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
import { TimetableService } from "./timetable.service";
import { CreateTimetableEntryDto } from "./dto/create-timetable-entry.dto";
import { UpdateTimetableEntryDto } from "./dto/update-timetable-entry.dto";
import { TimetableEntry } from "../../entities";

@ApiTags("timetable")
@Controller("timetable")
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  @Post()
  @ApiOperation({ summary: "Создать новое занятие в расписании" })
  @ApiResponse({
    status: 201,
    description: "Занятие успешно создано",
    type: TimetableEntry,
  })
  @ApiResponse({ status: 400, description: "Некорректные данные" })
  @ApiBearerAuth()
  async create(
    @Body() createTimetableEntryDto: CreateTimetableEntryDto,
  ): Promise<TimetableEntry> {
    return await this.timetableService.create(createTimetableEntryDto);
  }

  @Get()
  @ApiOperation({ summary: "Получить расписание с фильтрами" })
  @ApiResponse({
    status: 200,
    description: "Список занятий",
    type: [TimetableEntry],
  })
  @ApiQuery({ name: "date", required: false, description: "Фильтр по дате" })
  @ApiQuery({
    name: "trainerId",
    required: false,
    description: "Фильтр по тренеру",
  })
  @ApiQuery({ name: "type", required: false, description: "Фильтр по типу" })
  async findAll(@Query() filters: any): Promise<TimetableEntry[]> {
    return await this.timetableService.findAll(filters);
  }

  @Get(":id")
  @ApiOperation({ summary: "Получить занятие по ID" })
  @ApiParam({ name: "id", description: "UUID занятия" })
  @ApiResponse({
    status: 200,
    description: "Занятие найдено",
    type: TimetableEntry,
  })
  @ApiResponse({ status: 404, description: "Занятие не найдено" })
  async findOne(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<TimetableEntry> {
    return await this.timetableService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Обновить занятие" })
  @ApiParam({ name: "id", description: "UUID занятия" })
  @ApiResponse({
    status: 200,
    description: "Занятие успешно обновлено",
    type: TimetableEntry,
  })
  @ApiResponse({ status: 404, description: "Занятие не найдено" })
  @ApiBearerAuth()
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateTimetableEntryDto: UpdateTimetableEntryDto,
  ): Promise<TimetableEntry> {
    return await this.timetableService.update(id, updateTimetableEntryDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Удалить занятие (мягкое удаление)" })
  @ApiParam({ name: "id", description: "UUID занятия" })
  @ApiResponse({ status: 204, description: "Занятие удалено" })
  @ApiResponse({ status: 404, description: "Занятие не найдено" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  async remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    return await this.timetableService.remove(id);
  }
}
