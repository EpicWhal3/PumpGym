import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Booking, User } from "../../entities";
import { Repository } from "typeorm";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { BookingStatus } from "../../common/enums/booking-status.enum";

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async createBooking(createBookingDto: CreateBookingDto): Promise<Booking> {
    if (createBookingDto.userId) {
      const user = await this.usersRepository.findOne({
        where: { id: createBookingDto.userId },
      });
      if (!user) {
        throw new NotFoundException("Пользователь не найден");
      }
    }

    const booking = this.bookingsRepository.create({
      ...createBookingDto,
      status: BookingStatus.PENDING,
      user: createBookingDto.userId
        ? { id: createBookingDto.userId }
        : undefined,
    });

    return await this.bookingsRepository.save(booking);
  }

  async findAll(): Promise<Booking[]> {
    return await this.bookingsRepository.find({
      relations: ["user"],
      order: { createdAt: "DESC" },
    });
  }

  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingsRepository.findOne({
      where: { id },
      relations: ["user"],
    });
    if (!booking) {
      throw new NotFoundException(`Заявка с ID "${id}" не найдена`);
    }
    return booking;
  }

  async updateStatus(id: string, status: BookingStatus): Promise<Booking> {
    const booking = await this.findOne(id);

    const validTransitions: Record<BookingStatus, BookingStatus[]> = {
      [BookingStatus.PENDING]: [
        BookingStatus.CONFIRMED,
        BookingStatus.CANCELLED,
      ],
      [BookingStatus.CONFIRMED]: [
        BookingStatus.CANCELLED,
        BookingStatus.COMPLETED,
      ],
      [BookingStatus.CANCELLED]: [],
      [BookingStatus.COMPLETED]: [],
    };

    if (!validTransitions[booking.status].includes(status)) {
      throw new BadRequestException(
        `Недопустимый переход статуса: ${booking.status} → ${status}`,
      );
    }

    booking.status = status;
    return await this.bookingsRepository.save(booking);
  }

  async cancelBooking(id: string): Promise<void> {
    await this.updateStatus(id, BookingStatus.CANCELLED);
  }

  async confirmBooking(id: string): Promise<void> {
    await this.updateStatus(id, BookingStatus.CONFIRMED);
  }

  async findByUser(userId: string): Promise<Booking[]> {
    return await this.bookingsRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: "DESC" },
    });
  }
}
