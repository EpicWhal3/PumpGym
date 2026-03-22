import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Tariff } from "../../entities";
import { CreateTariffDto } from "./dto/create-tariff.dto";
import { UpdateTariffDto } from "./dto/update-tariff.dto";

@Injectable()
export class TariffsService {
  constructor(
    @InjectRepository(Tariff)
    private tariffsRepository: Repository<Tariff>,
  ) {}

  async create(createTariffDto: CreateTariffDto): Promise<Tariff> {
    const existing = await this.tariffsRepository.findOne({
      where: { type: createTariffDto.type },
    });

    if (existing) {
      throw new BadRequestException(
        `Тариф с названием "${createTariffDto.type}" уже существует`,
      );
    }

    if (createTariffDto.price < 0) {
      throw new BadRequestException("Цена не может быть отрицательной");
    }

    if (createTariffDto.duration < 1) {
      throw new BadRequestException("Длительность должна быть минимум 1 день");
    }

    const tariff = this.tariffsRepository.create(createTariffDto);
    return await this.tariffsRepository.save(tariff);
  }

  async findAll(activeOnly: boolean = true): Promise<Tariff[]> {
    const where = activeOnly ? { isActive: true } : {};

    return await this.tariffsRepository.find({
      where,
      order: { price: "ASC" },
    });
  }

  async findOne(id: string): Promise<Tariff> {
    const tariff = await this.tariffsRepository.findOne({
      where: { id },
    });

    if (!tariff) {
      throw new NotFoundException(`Тариф с ID "${id}" не найден`);
    }

    return tariff;
  }

  async update(id: string, updateTariffDto: UpdateTariffDto): Promise<Tariff> {
    const tariff = await this.findOne(id);

    if (updateTariffDto.type && updateTariffDto.type !== tariff.type) {
      throw new BadRequestException("Нельзя изменить тип тарифа");
    }

    Object.assign(tariff, updateTariffDto);
    return await this.tariffsRepository.save(tariff);
  }

  async remove(id: string): Promise<void> {
    const tariff = await this.findOne(id);

    // TODO: Проверить наличие активных пользовательских подписок

    tariff.isActive = false;
    await this.tariffsRepository.save(tariff);
  }

  // TODO: Реализовать через подсчёт пользовательских подписок
}
