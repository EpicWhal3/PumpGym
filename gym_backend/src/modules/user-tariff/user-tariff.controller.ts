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
import { AssignTariffService } from "./assign-tariff.service";
import { AssignTariffDto } from "./dto/assign-tariff.dto";
import { UserTariff } from "../../entities";

@ApiTags("user-tariff")
@Controller("user-tariff")
export class UserTariffController {
  constructor(private readonly userTariffService: AssignTariffService) {}

  @Post()
  @ApiOperation({ summary: "Назначить тариф пользователю" })
  @ApiResponse({
    status: 201,
    description: "Тариф успешно назначен",
    type: UserTariff,
  })
  @ApiResponse({ status: 400, description: "Тариф не активен" })
  @ApiResponse({
    status: 404,
    description: "Пользователь или тариф не найдены",
  })
  @ApiBearerAuth()
  async assign(@Body() assignTariffDto: AssignTariffDto): Promise<UserTariff> {
    return await this.userTariffService.assignTariff(assignTariffDto);
  }

  @Get()
  @ApiOperation({ summary: "Получить список подписок пользователя" })
  @ApiResponse({
    status: 200,
    description: "Список подписок",
    type: [UserTariff],
  })
  @ApiQuery({ name: "userId", required: true, description: "ID пользователя" })
  @ApiBearerAuth()
  async findByUser(@Query("userId") userId: string): Promise<UserTariff[]> {
    return await this.userTariffService.findByUser(userId);
  }

  @Get("active")
  @ApiOperation({ summary: "Получить активную подписку пользователя" })
  @ApiResponse({
    status: 200,
    description: "Активная подписка",
    type: UserTariff,
  })
  @ApiResponse({ status: 404, description: "Нет активной подписки" })
  @ApiQuery({ name: "userId", required: true, description: "ID пользователя" })
  @ApiBearerAuth()
  async getActive(@Query("userId") userId: string): Promise<UserTariff | null> {
    return await this.userTariffService.getActiveTariff(userId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Получить подписку по ID" })
  @ApiParam({ name: "id", description: "UUID подписки" })
  @ApiResponse({ status: 200, description: "Подписка найдена" })
  @ApiResponse({ status: 404, description: "Подписка не найдена" })
  @ApiBearerAuth()
  async findOne(@Param("id", ParseUUIDPipe) id: string): Promise<UserTariff> {
    return await this.userTariffService.findOne(id);
  }

  @Post(":id/renew")
  @ApiOperation({ summary: "Продлить подписку" })
  @ApiParam({ name: "id", description: "UUID подписки" })
  @ApiResponse({
    status: 200,
    description: "Тариф продлена",
    type: UserTariff,
  })
  @ApiResponse({ status: 404, description: "Тариф не найдена" })
  @ApiBearerAuth()
  async renew(
    @Param("id", ParseUUIDPipe) id: string,
    @Query("tariffId") tariffId: string,
  ): Promise<UserTariff> {
    const tariff = await this.userTariffService.findOne(id);
    return await this.userTariffService.renewTariff(tariff.userId, tariffId);
  }

  @Post(":id/suspend")
  @ApiOperation({ summary: "Заморозить подписку" })
  @ApiParam({ name: "id", description: "UUID подписки" })
  @ApiResponse({
    status: 200,
    description: "Тариф заморожена",
    type: UserTariff,
  })
  @ApiResponse({ status: 400, description: "Нельзя заморозить" })
  @ApiBearerAuth()
  async suspend(@Param("id", ParseUUIDPipe) id: string): Promise<UserTariff> {
    return await this.userTariffService.suspendTariff(id);
  }

  @Post(":id/activate")
  @ApiOperation({ summary: "Разморозить подписку" })
  @ApiParam({ name: "id", description: "UUID подписки" })
  @ApiResponse({
    status: 200,
    description: "Тариф активирована",
    type: UserTariff,
  })
  @ApiResponse({ status: 400, description: "Тариф не заморожена" })
  @ApiBearerAuth()
  async activate(@Param("id", ParseUUIDPipe) id: string): Promise<UserTariff> {
    return await this.userTariffService.activateTariff(id);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Отменить тариф" })
  @ApiParam({ name: "id", description: "UUID тарифа" })
  @ApiResponse({ status: 204, description: "Тариф отменен" })
  @ApiResponse({ status: 404, description: "Тариф не найден" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  async remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    await this.userTariffService.remove(id);
  }
}
