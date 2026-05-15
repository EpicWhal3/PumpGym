import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./user.entity";
import { Tariff } from "./tariff.entity";
import { TariffState } from "../common/enums/tariff-status.enum";

@Entity("user_tariffs")
export class UserTariff {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid", name: "userId" })
  userId: string;

  @ManyToOne(() => User, (user) => user.tariffs)
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ type: "uuid", name: "tariffId" })
  tariffId: string;

  @ManyToOne(() => Tariff, (tariff) => tariff.userTariffs)
  @JoinColumn({ name: "tariffId" })
  tariff: Tariff;

  @Column({ type: "timestamp" })
  startDate: Date;

  @Column({ type: "timestamp" })
  endDate: Date;

  @Column({ type: "enum", enum: TariffState, default: TariffState.ACTIVE })
  status: TariffState;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;
}
