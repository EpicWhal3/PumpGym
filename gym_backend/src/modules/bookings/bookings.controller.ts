import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Patch,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { BookingsService } from "./bookings.service";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { Booking } from "../../entities";
import { UpdateBookingStatusDto } from "./dto/update-booking.dto";

@ApiTags("bookings")
@Controller("bookings")
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
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
  @ApiBearerAuth()
  async findAll(): Promise<Booking[]> {
    return await this.bookingsService.findAll();
  }

  @Get("user/:userId")
  @ApiOperation({ summary: "Получить заявки пользователя" })
  @ApiParam({ name: "userId", description: "UUID пользователя" })
  @ApiResponse({ status: 200, description: "Список заявок пользователя" })
  @ApiBearerAuth()
  async findByUser(
    @Param("userId", ParseUUIDPipe) userId: string,
  ): Promise<Booking[]> {
    return await this.bookingsService.findByUser(userId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Получить заявку по ID" })
  @ApiParam({ name: "id", description: "UUID заявки" })
  @ApiResponse({
    status: 200,
    description: "Заявка найдена",
    type: Booking,
  })
  @ApiResponse({ status: 404, description: "Заявка не найдена" })
  async findOne(@Param("id", ParseUUIDPipe) id: string): Promise<Booking> {
    return await this.bookingsService.findOne(id);
  }

  @Patch(":id/status")
  @ApiOperation({ summary: "Изменить статус заявки" })
  @ApiParam({ name: "id", description: "UUID заявки" })
  @ApiResponse({
    status: 200,
    description: "Статус успешно изменён",
    type: Booking,
  })
  @ApiResponse({ status: 400, description: "Недопустимый переход статуса" })
  @ApiResponse({ status: 404, description: "Заявка не найдена" })
  @ApiBearerAuth()
  async updateStatus(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateStatusDto: UpdateBookingStatusDto,
  ): Promise<Booking> {
    return await this.bookingsService.updateStatus(id, updateStatusDto.status);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Отменить заявку" })
  @ApiParam({ name: "id", description: "UUID заявки" })
  @ApiResponse({ status: 204, description: "Заявка отменена" })
  @ApiResponse({ status: 404, description: "Заявка не найдена" })
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancel(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    return await this.bookingsService.cancelBooking(id);
  }
}
