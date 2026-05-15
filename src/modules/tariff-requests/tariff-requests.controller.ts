import {
  Body,
  Controller,
  Get,
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
import { TariffRequestsService } from "./tariff-requests.service";
import { CreateTariffRequestDto } from "./dto/create-tariff-request.dto";
import { ReviewTariffRequestDto } from "./dto/review-tariff-request.dto";
import { TariffRequest } from "../../entities";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/interfaces/authenticated-user.interface";
import { Roles } from "../../common/decorators/roles.decorator";
import { UserRole } from "../../common/enums/user-roles.enum";
import { TariffRequestStatus } from "../../common/enums/tariff-request-status.enum";

@ApiTags("tariff-requests")
@ApiBearerAuth("JWT-auth")
@Controller("tariff-requests")
export class TariffRequestsController {
  constructor(private readonly tariffRequestsService: TariffRequestsService) {}

  @Post()
  @Roles(UserRole.USER)
  @ApiOperation({ summary: "Создать заявку на выдачу тарифа" })
  @ApiResponse({
    status: 201,
    description: "Заявка создана",
    type: TariffRequest,
  })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateTariffRequestDto,
  ): Promise<TariffRequest> {
    return this.tariffRequestsService.create(user.id, dto);
  }

  @Get("my")
  @Roles(UserRole.USER)
  @ApiOperation({ summary: "Получить свои заявки на тарифы" })
  @ApiResponse({
    status: 200,
    description: "Список заявок",
    type: [TariffRequest],
  })
  findMine(@CurrentUser() user: AuthenticatedUser): Promise<TariffRequest[]> {
    return this.tariffRequestsService.findByUser(user.id);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Получить заявки на тарифы" })
  @ApiQuery({ name: "status", required: false, enum: TariffRequestStatus })
  @ApiResponse({
    status: 200,
    description: "Список заявок",
    type: [TariffRequest],
  })
  findAll(
    @Query("status") status?: TariffRequestStatus,
  ): Promise<TariffRequest[]> {
    return this.tariffRequestsService.findAll(status);
  }

  @Post(":id/approve")
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Одобрить заявку и назначить тариф" })
  @ApiParam({ name: "id", description: "UUID заявки" })
  approve(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ReviewTariffRequestDto,
  ): Promise<TariffRequest> {
    return this.tariffRequestsService.approve(id, dto.adminComment);
  }

  @Post(":id/reject")
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Отклонить заявку на тариф" })
  @ApiParam({ name: "id", description: "UUID заявки" })
  reject(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ReviewTariffRequestDto,
  ): Promise<TariffRequest> {
    return this.tariffRequestsService.reject(id, dto.adminComment);
  }
}
