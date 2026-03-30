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
import { TrainersService } from "./trainers.service";
import { CreateTrainerDto } from "./dto/create-trainer.dto";
import { UpdateTrainerDto } from "./dto/update-trainer.dto";
import { Trainer } from "../../entities";

@ApiTags("trainers")
@Controller("trainers")
export class TrainersController {
  constructor(private readonly trainersService: TrainersService) {}

  @Post()
  @ApiOperation({ summary: "Создать нового тренера" })
  @ApiResponse({
    status: 201,
    description: "Тренер успешно создан",
    type: Trainer,
  })
  @ApiResponse({ status: 400, description: "Некорректные данные" })
  @ApiBearerAuth()
  async create(@Body() createTrainerDto: CreateTrainerDto): Promise<Trainer> {
    return await this.trainersService.create(createTrainerDto);
  }

  @Get()
  @ApiOperation({ summary: "Получить список тренеров" })
  @ApiResponse({
    status: 200,
    description: "Список тренеров",
    type: [Trainer],
  })
  async findAll(): Promise<Trainer[]> {
    return await this.trainersService.findAll();
  }

  @Get("top-rated")
  @ApiOperation({ summary: "Получить топ тренеров по рейтингу" })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Количество (по умолчанию 5)",
  })
  @ApiResponse({ status: 200, description: "Топ тренеров" })
  async getTopRated(@Query("limit") limit?: number): Promise<Trainer[]> {
    return await this.trainersService.getTopRated(limit ?? 5);
  }

  @Get("specialty/:specialty")
  @ApiOperation({ summary: "Найти тренеров по специализации" })
  @ApiParam({
    name: "specialty",
    description: "Специализация",
    example: "Йога",
  })
  @ApiResponse({ status: 200, description: "Список тренеров" })
  async findBySpecialty(
    @Param("specialty") specialty: string,
  ): Promise<Trainer[]> {
    return await this.trainersService.findBySpecialty(specialty);
  }

  @Get(":id")
  @ApiOperation({ summary: "Получить тренера по ID" })
  @ApiParam({ name: "id", description: "UUID тренера" })
  @ApiResponse({
    status: 200,
    description: "Тренер найден",
    type: Trainer,
  })
  @ApiResponse({ status: 404, description: "Тренер не найден" })
  async findOne(@Param("id", ParseUUIDPipe) id: string): Promise<Trainer> {
    return await this.trainersService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Обновить данные тренера" })
  @ApiParam({ name: "id", description: "UUID тренера" })
  @ApiResponse({
    status: 200,
    description: "Тренер успешно обновлён",
    type: Trainer,
  })
  @ApiResponse({ status: 404, description: "Тренер не найден" })
  @ApiBearerAuth()
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateTrainerDto: UpdateTrainerDto,
  ): Promise<Trainer> {
    return await this.trainersService.update(id, updateTrainerDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Удалить тренера (мягкое удаление)" })
  @ApiParam({ name: "id", description: "UUID тренера" })
  @ApiResponse({ status: 204, description: "Тренер удалён" })
  @ApiResponse({ status: 404, description: "Тренер не найден" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  async remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    return await this.trainersService.remove(id);
  }
}
