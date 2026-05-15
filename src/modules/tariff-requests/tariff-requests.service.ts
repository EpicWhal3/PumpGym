import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Tariff, TariffRequest, User } from "../../entities";
import { TariffRequestStatus } from "../../common/enums/tariff-request-status.enum";
import { CreateTariffRequestDto } from "./dto/create-tariff-request.dto";
import { AssignTariffService } from "../user-tariff/assign-tariff.service";

const DAY_MS = 24 * 60 * 60 * 1000;
const RENEW_WINDOW_DAYS = 5;

@Injectable()
export class TariffRequestsService {
  constructor(
    @InjectRepository(TariffRequest)
    private tariffRequestsRepository: Repository<TariffRequest>,

    @InjectRepository(Tariff)
    private tariffsRepository: Repository<Tariff>,

    @InjectRepository(User)
    private usersRepository: Repository<User>,

    private readonly assignTariffService: AssignTariffService,
  ) {}

  async create(
    userId: string,
    dto: CreateTariffRequestDto,
  ): Promise<TariffRequest> {
    const [user, tariff] = await Promise.all([
      this.usersRepository.findOne({ where: { id: userId, isActive: true } }),
      this.tariffsRepository.findOne({ where: { id: dto.tariffId } }),
    ]);

    if (!user) {
      throw new NotFoundException("Пользователь не найден");
    }

    if (!tariff) {
      throw new NotFoundException("Тариф не найден");
    }

    if (!tariff.isActive) {
      throw new BadRequestException("Нельзя запросить неактивный тариф");
    }

    await this.ensureTariffRequestAllowed(userId, dto.tariffId);

    const existingPending = await this.tariffRequestsRepository.findOne({
      where: {
        userId,
        tariffId: dto.tariffId,
        status: TariffRequestStatus.PENDING,
      },
    });

    if (existingPending) {
      throw new BadRequestException(
        "Заявка на этот тариф уже ожидает обработки",
      );
    }

    const request = this.tariffRequestsRepository.create({
      userId,
      tariffId: dto.tariffId,
      comment: dto.comment?.trim() || null,
      status: TariffRequestStatus.PENDING,
    });

    return this.tariffRequestsRepository.save(request);
  }

  async findAll(status?: TariffRequestStatus): Promise<TariffRequest[]> {
    return this.tariffRequestsRepository.find({
      where: status ? { status } : {},
      relations: ["user", "tariff"],
      order: { createdAt: "DESC" },
    });
  }

  async findByUser(userId: string): Promise<TariffRequest[]> {
    return this.tariffRequestsRepository.find({
      where: { userId },
      relations: ["tariff"],
      order: { createdAt: "DESC" },
    });
  }

  async countPending(): Promise<number> {
    return this.tariffRequestsRepository.count({
      where: { status: TariffRequestStatus.PENDING },
    });
  }

  async findOne(id: string): Promise<TariffRequest> {
    const request = await this.tariffRequestsRepository.findOne({
      where: { id },
      relations: ["user", "tariff"],
    });

    if (!request) {
      throw new NotFoundException("Заявка на тариф не найдена");
    }

    return request;
  }

  async approve(id: string, adminComment?: string): Promise<TariffRequest> {
    const request = await this.findOne(id);

    if (request.status !== TariffRequestStatus.PENDING) {
      throw new BadRequestException("Можно обработать только ожидающую заявку");
    }

    await this.ensureTariffRequestAllowed(request.userId, request.tariffId);

    const activeTariff = await this.assignTariffService.getActiveTariff(
      request.userId,
    );

    if (activeTariff) {
      await this.assignTariffService.renewTariff(
        request.userId,
        request.tariffId,
      );
    } else {
      await this.assignTariffService.assignTariff({
        userId: request.userId,
        tariffId: request.tariffId,
      });
    }

    request.status = TariffRequestStatus.APPROVED;
    request.adminComment = adminComment?.trim() || null;
    request.processedAt = new Date();

    return this.tariffRequestsRepository.save(request);
  }

  async reject(id: string, adminComment?: string): Promise<TariffRequest> {
    const request = await this.findOne(id);

    if (request.status !== TariffRequestStatus.PENDING) {
      throw new BadRequestException("Можно обработать только ожидающую заявку");
    }

    request.status = TariffRequestStatus.REJECTED;
    request.adminComment = adminComment?.trim() || null;
    request.processedAt = new Date();

    return this.tariffRequestsRepository.save(request);
  }

  private async ensureTariffRequestAllowed(
    userId: string,
    tariffId: string,
  ): Promise<void> {
    const activeTariff = await this.assignTariffService.getActiveTariff(userId);

    if (!activeTariff) {
      return;
    }

    const daysLeft = Math.ceil(
      (new Date(activeTariff.endDate).getTime() - Date.now()) / DAY_MS,
    );

    if (daysLeft > RENEW_WINDOW_DAYS) {
      throw new BadRequestException(
        `Оформление или продление абонемента доступно только за ${RENEW_WINDOW_DAYS} дней до окончания текущего. Сейчас осталось ${daysLeft} дн.`,
      );
    }

    const alreadyHasSameTariff = activeTariff.tariffId === tariffId;

    if (alreadyHasSameTariff && daysLeft > RENEW_WINDOW_DAYS) {
      throw new BadRequestException(
        "У вас уже есть активный такой же абонемент",
      );
    }
  }
}
