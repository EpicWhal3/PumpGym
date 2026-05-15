import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./user.entity";
import { Tariff } from "./tariff.entity";
import { TariffRequestStatus } from "../common/enums/tariff-request-status.enum";

@Entity("tariff_requests")
export class TariffRequest {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid", name: "userId" })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ type: "uuid", name: "tariffId" })
  tariffId: string;

  @ManyToOne(() => Tariff)
  @JoinColumn({ name: "tariffId" })
  tariff: Tariff;

  @Column({
    type: "enum",
    enum: TariffRequestStatus,
    default: TariffRequestStatus.PENDING,
  })
  status: TariffRequestStatus;

  @Column({ type: "text", nullable: true })
  comment?: string | null;

  @Column({ type: "text", nullable: true })
  adminComment?: string | null;

  @Column({ type: "timestamp", nullable: true })
  processedAt?: Date | null;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;
}
