import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Tariff, User, UserTariff } from "../../entities";
import { MoreThanOrEqual, Repository } from "typeorm";
import { AssignTariffDto } from "./dto/assign-tariff.dto";
import { TariffState } from "../../common/enums/tariff-status.enum";

@Injectable()
export class AssignTariffService {
  constructor(
    @InjectRepository(UserTariff)
    private userTariffRepository: Repository<UserTariff>,
    @InjectRepository(Tariff)
    private tariffRepository: Repository<Tariff>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async assignTariff(tariffDto: AssignTariffDto): Promise<UserTariff> {
    const { userId, tariffId, startDate } = tariffDto;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("Пользователь не найден");
    }

    const tariff = await this.tariffRepository.findOne({
      where: { id: tariffId },
    });
    if (!tariff) {
      throw new NotFoundException("Тариф не найден");
    }

    if (!tariff.isActive) {
      throw new BadRequestException("Тариф не активен");
    }

    const start = startDate ? new Date(startDate) : new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + tariff.duration);

    await this.deactivateActiveTariff(userId);

    const newUserTariff = this.userTariffRepository.create({
      userId: userId,
      tariffId: tariffId,
      startDate: start,
      endDate: end,
      status: TariffState.ACTIVE,
    });

    return await this.userTariffRepository.save(newUserTariff);
  }

  async getActiveTariff(userId: string): Promise<UserTariff | null> {
    const now = new Date();

    const expiredTariffs = await this.userTariffRepository
      .createQueryBuilder("ut")
      .where("ut.userId = :userId", { userId })
      .andWhere("ut.status = :status", { status: TariffState.ACTIVE })
      .andWhere("ut.endDate < :now", { now })
      .getMany();

    if (expiredTariffs.length > 0) {
      for (const t of expiredTariffs) {
        t.status = TariffState.EXPIRED;
      }
      await this.userTariffRepository.save(expiredTariffs);
    }

    return await this.userTariffRepository.findOne({
      where: {
        userId,
        status: TariffState.ACTIVE,
        endDate: MoreThanOrEqual(now),
      },
      relations: ["tariff"],
    });
  }

  async findAll(): Promise<UserTariff[]> {
    return await this.userTariffRepository.find({
      relations: ["user", "tariff"],
      order: { createdAt: "DESC" },
    });
  }

  async findByUser(userId: string): Promise<UserTariff[]> {
    return await this.userTariffRepository.find({
      where: { user: { id: userId } },
      relations: ["tariff"],
      order: { startDate: "DESC" },
    });
  }

  async renewTariff(userId: string, tariffId: string): Promise<UserTariff> {
    const activeTariff = await this.getActiveTariff(userId);

    if (activeTariff) {
      const newEnd = new Date(activeTariff.endDate);
      const tariff = await this.tariffRepository.findOne({
        where: { id: tariffId },
      });

      if (!tariff) {
        throw new NotFoundException("Тариф не найден");
      }

      if (!tariff.isActive) {
        throw new BadRequestException("Тариф не активен");
      }

      newEnd.setDate(newEnd.getDate() + tariff.duration);

      activeTariff.endDate = newEnd;
      activeTariff.tariffId = tariffId;
      activeTariff.status = TariffState.ACTIVE;

      return await this.userTariffRepository.save(activeTariff);
    } else {
      return await this.assignTariff({
        userId,
        tariffId,
      });
    }
  }

  async suspendTariff(id: string): Promise<UserTariff> {
    const tariff = await this.userTariffRepository.findOne({
      where: { id },
    });

    if (!tariff) {
      throw new NotFoundException("Подписка не найдена");
    }

    if (tariff.status !== TariffState.ACTIVE) {
      throw new BadRequestException(
        "Можно заморозить только активную подписку",
      );
    }

    tariff.status = TariffState.SUSPENDED;
    return await this.userTariffRepository.save(tariff);
  }

  async activateTariff(id: string): Promise<UserTariff> {
    const tariff = await this.userTariffRepository.findOne({
      where: { id },
    });

    if (!tariff) {
      throw new NotFoundException("Подписка не найдена");
    }

    if (tariff.status !== TariffState.SUSPENDED) {
      throw new BadRequestException("Подписка не заморожена");
    }

    tariff.status = TariffState.ACTIVE;
    return await this.userTariffRepository.save(tariff);
  }

  async cancelTariff(
    id: string,
    actorUserId: string,
    isAdmin = false,
  ): Promise<UserTariff> {
    const tariff = await this.findOne(id);

    if (!isAdmin && tariff.userId !== actorUserId) {
      throw new ForbiddenException("Нельзя отменить чужой абонемент");
    }

    if (tariff.status !== TariffState.ACTIVE) {
      throw new BadRequestException("Можно отменить только активный абонемент");
    }

    tariff.status = TariffState.CANCELLED;

    return await this.userTariffRepository.save(tariff);
  }

  async findOne(id: string): Promise<UserTariff> {
    const tariff = await this.userTariffRepository.findOne({
      where: { id },
      relations: ["tariff", "user"],
    });

    if (!tariff) {
      throw new NotFoundException("Подписка не найдена");
    }

    return tariff;
  }

  async remove(id: string): Promise<void> {
    const tariff = await this.findOne(id);

    tariff.status = TariffState.CANCELLED;

    await this.userTariffRepository.save(tariff);
  }

  private async deactivateActiveTariff(userId: string): Promise<void> {
    const activeTariffs = await this.userTariffRepository.find({
      where: {
        userId,
        status: TariffState.ACTIVE,
      },
    });

    for (const sub of activeTariffs) {
      sub.status = TariffState.EXPIRED;
    }

    if (activeTariffs.length > 0) {
      await this.userTariffRepository.save(activeTariffs);
    }
  }
}
