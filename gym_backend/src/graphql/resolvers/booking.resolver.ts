import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import { BookingType } from "../types/booking.type";
import { CreateBookingInput, UpdateBookingStatusInput } from "../inputs";
import { BookingsService } from "../../modules/bookings/bookings.service";
import { BookingStatus } from "../../common/enums/booking-status.enum";

@Resolver(() => BookingType)
export class BookingResolver {
  constructor(private readonly bookingsService: BookingsService) {}

  @Query(() => [BookingType], {
    name: "bookings",
    description: "Получить все заявки",
  })
  async getBookings() {
    return this.bookingsService.findAll();
  }

  @Query(() => BookingType, {
    name: "booking",
    description: "Получить заявку по ID",
  })
  async getBooking(@Args("id", { type: () => ID }) id: string) {
    return this.bookingsService.findOne(id);
  }

  @Query(() => [BookingType], {
    name: "bookingsByUser",
    description: "Получить заявки пользователя",
  })
  async getBookingsByUser(@Args("userId", { type: () => ID }) userId: string) {
    return this.bookingsService.findByUser(userId);
  }

  @Mutation(() => BookingType, {
    name: "createBooking",
    description: "Создать новую заявку",
  })
  async createBooking(@Args("input") input: CreateBookingInput) {
    return this.bookingsService.createBooking(input);
  }

  @Mutation(() => BookingType, {
    name: "updateBookingStatus",
    description: "Изменить статус заявки",
  })
  async updateBookingStatus(@Args("input") input: UpdateBookingStatusInput) {
    return this.bookingsService.updateStatus(input.id, input.status);
  }

  @Mutation(() => BookingType, {
    name: "cancelBooking",
    description: "Отменить заявку",
  })
  async cancelBooking(@Args("id", { type: () => ID }) id: string) {
    return this.bookingsService.updateStatus(id, BookingStatus.CANCELLED);
  }
}
