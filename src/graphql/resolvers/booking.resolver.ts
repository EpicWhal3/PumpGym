import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { BookingType } from "../types/booking.type";
import { CreateBookingInput } from "../inputs";
import { BookingsService } from "../../modules/bookings/bookings.service";
import { BookingStatus } from "../../common/enums/booking-status.enum";
import { Public } from "../../common/decorators/public.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { UserRole } from "../../common/enums/user-roles.enum";

@Resolver(() => BookingType)
export class BookingResolver {
  constructor(private readonly bookingsService: BookingsService) {}

  @Query(() => [BookingType], {
    name: "bookings",
    description: "Получить все заявки",
  })
  @Roles(UserRole.ADMIN)
  async getBookings() {
    return this.bookingsService.findAll();
  }

  @Query(() => BookingType, {
    name: "booking",
    description: "Получить заявку по ID",
  })
  @Roles(UserRole.ADMIN)
  async getBooking(@Args("id", { type: () => ID }) id: string) {
    return this.bookingsService.findOne(id);
  }

  @Query(() => [BookingType], {
    name: "bookingsByUser",
    description: "Получить заявки пользователя",
  })
  @Roles(UserRole.ADMIN, UserRole.USER)
  async getBookingsByUser(@Args("userId", { type: () => ID }) userId: string) {
    return this.bookingsService.findByUser(userId);
  }

  @Mutation(() => BookingType, {
    name: "createBooking",
    description: "Создать новую заявку",
  })
  @Public()
  async createBooking(@Args("input") input: CreateBookingInput) {
    return this.bookingsService.createBooking(input);
  }

  @Mutation(() => BookingType, {
    name: "cancelBooking",
    description: "Отменить заявку",
  })
  @Roles(UserRole.ADMIN)
  async cancelBooking(@Args("id", { type: () => ID }) id: string) {
    return this.bookingsService.updateStatus(id, BookingStatus.CANCELLED);
  }
}
