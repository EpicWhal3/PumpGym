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
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { BookingsService } from "./bookings.service";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { Booking } from "../../entities";
import { UpdateBookingStatusDto } from "./dto/update-booking.dto";
import { Public } from "../../common/decorators/public.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { UserRole } from "../../common/enums/user-roles.enum";

@ApiTags("bookings")
@Controller("bookings")
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: "Создать новую заявку на запись" })
  @ApiResponse({
    status: 201,
    description: "Заявка успешно создана",
    type: Booking,
  })
  @ApiResponse({ status: 400, description: "Некорректные данные" })
  async create(@Body() createBookingDto: CreateBookingDto): Promise<Booking> {
    return await this.bookingsService.createBooking(createBookingDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Получить список заявок" })
  @ApiResponse({
    status: 200,
    description: "Список заявок",
    type: [Booking],
  })
  @ApiQuery({
    name: "userId",
    required: false,
    description: "Фильтр по пользователю",
  })
  @ApiQuery({
    name: "status",
    required: false,
    description: "Фильтр по статусу",
  })
  @ApiBearerAuth("JWT-auth")
  async findAll(): Promise<Booking[]> {
    return await this.bookingsService.findAll();
  }

  @Get("user/:userId")
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: "Получить заявки пользователя" })
  @ApiParam({ name: "userId", description: "UUID пользователя" })
  @ApiResponse({ status: 200, description: "Список заявок пользователя" })
  @ApiBearerAuth("JWT-auth")
  async findByUser(
    @Param("userId", ParseUUIDPipe) userId: string,
  ): Promise<Booking[]> {
    return await this.bookingsService.findByUser(userId);
  }

  @Get(":id")
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Получить заявку по ID" })
  @ApiParam({ name: "id", description: "UUID заявки" })
  @ApiResponse({
    status: 200,
    description: "Заявка найдена",
    type: Booking,
  })
  @ApiResponse({ status: 404, description: "Заявка не найдена" })
  @ApiBearerAuth("JWT-auth")
  async findOne(@Param("id", ParseUUIDPipe) id: string): Promise<Booking> {
    return await this.bookingsService.findOne(id);
  }

  @Patch(":id/status")
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Изменить статус заявки" })
  @ApiParam({ name: "id", description: "UUID заявки" })
  @ApiResponse({
    status: 200,
    description: "Статус успешно изменён",
    type: Booking,
  })
  @ApiResponse({ status: 400, description: "Недопустимый переход статуса" })
  @ApiResponse({ status: 404, description: "Заявка не найдена" })
  @ApiBearerAuth("JWT-auth")
  async updateStatus(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateStatusDto: UpdateBookingStatusDto,
  ): Promise<Booking> {
    return await this.bookingsService.updateStatus(id, updateStatusDto.status);
  }

  @Delete(":id")
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Отменить заявку" })
  @ApiParam({ name: "id", description: "UUID заявки" })
  @ApiResponse({ status: 204, description: "Заявка отменена" })
  @ApiResponse({ status: 404, description: "Заявка не найдена" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth("JWT-auth")
  async cancel(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    return await this.bookingsService.cancelBooking(id);
  }
}
