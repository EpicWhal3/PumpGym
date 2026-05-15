import {
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
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { TrainersService } from "./trainers.service";
import { CreateTrainerDto } from "./dto/create-trainer.dto";
import { UpdateTrainerDto } from "./dto/update-trainer.dto";
import { Trainer } from "../../entities";
import { Public } from "../../common/decorators/public.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { UserRole } from "../../common/enums/user-roles.enum";

@ApiTags("trainers")
@Controller("trainers")
export class TrainersController {
  constructor(private readonly trainersService: TrainersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Создать нового тренера" })
  @ApiResponse({
    status: 201,
    description: "Тренер успешно создан",
    type: Trainer,
  })
  @ApiResponse({ status: 400, description: "Некорректные данные" })
  @ApiBearerAuth("JWT-auth")
  async create(@Body() createTrainerDto: CreateTrainerDto): Promise<Trainer> {
    return await this.trainersService.create(createTrainerDto);
  }

  @Get()
  @Public()
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
  @Public()
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
  @Public()
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
  @Public()
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
  @Roles(UserRole.ADMIN, UserRole.TRAINER)
  @ApiOperation({ summary: "Обновить данные тренера" })
  @ApiParam({ name: "id", description: "UUID тренера" })
  @ApiResponse({
    status: 200,
    description: "Тренер успешно обновлён",
    type: Trainer,
  })
  @ApiResponse({ status: 404, description: "Тренер не найден" })
  @ApiBearerAuth("JWT-auth")
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateTrainerDto: UpdateTrainerDto,
  ): Promise<Trainer> {
    return await this.trainersService.update(id, updateTrainerDto);
  }

  @Delete(":id")
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Деактивировать тренера)" })
  @ApiParam({ name: "id", description: "UUID тренера" })
  @ApiResponse({ status: 204, description: "Тренер удалён" })
  @ApiResponse({ status: 404, description: "Тренер не найден" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth("JWT-auth")
  async remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    return await this.trainersService.remove(id);
  }
}
