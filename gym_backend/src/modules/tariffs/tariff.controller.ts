import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { TariffsService } from "./tariff.service";
import { CreateTariffDto } from "./dto/create-tariff.dto";
import { UpdateTariffDto } from "./dto/update-tariff.dto";
import { Tariff } from "../../entities";

@ApiTags("tariffs")
@Controller("tariffs")
export class TariffController {
  constructor(private readonly tariffsService: TariffsService) {}

  @Post()
  @ApiOperation({ summary: "Создать новый тариф" })
  @ApiResponse({
    status: 201,
    description: "Тариф успешно создан",
    type: Tariff,
  })
  @ApiResponse({ status: 400, description: "Некорректные данные" })
  @ApiBearerAuth()
  async create(
    @Body() createTariffDto: CreateTariffDto,
  ): Promise<Tariff> {
    return await this.tariffsService.create(createTariffDto);
  }

  @Get()
  @ApiOperation({ summary: "Получить список тарифов" })
  @ApiResponse({
    status: 200,
    description: "Список тарифов",
    type: [Tariff],
  })
  async findAll(): Promise<Tariff[]> {
    return await this.tariffsService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Получить тариф по ID" })
  @ApiParam({ name: "id", description: "UUID тарифа" })
  @ApiResponse({
    status: 200,
    description: "Тариф найден",
    type: Tariff,
  })
  @ApiResponse({ status: 404, description: "Тариф не найден" })
  async findOne(@Param("id", ParseUUIDPipe) id: string): Promise<Tariff> {
    return await this.tariffsService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Обновить тариф" })
  @ApiParam({ name: "id", description: "UUID тарифа" })
  @ApiResponse({
    status: 200,
    description: "Тариф успешно обновлён",
    type: Tariff,
  })
  @ApiResponse({ status: 404, description: "Тариф не найден" })
  @ApiBearerAuth()
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateTariffDto: UpdateTariffDto,
  ): Promise<Tariff> {
    return await this.tariffsService.update(id, updateTariffDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Удалить тариф (мягкое удаление)" })
  @ApiParam({ name: "id", description: "UUID тарифа" })
  @ApiResponse({ status: 204, description: "Тариф удалён" })
  @ApiResponse({ status: 404, description: "Тариф не найден" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  async remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    return await this.tariffsService.remove(id);
  }
}
