import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./user.entity";
import { ServiceType } from "../common/enums/service-types.enum";
import { BookingStatus } from "../common/enums/booking-status.enum";
import { Trainer } from "./trainer.entity";

@Entity("bookings")
export class Booking {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, (user) => user.bookings, { nullable: true })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ type: "varchar", length: 100, nullable: false })
  name: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  email: string;

  @Column({ type: "varchar", length: 20, nullable: false })
  phone: string;

  @Column({ type: "enum", enum: ServiceType })
  serviceType: ServiceType;

  @Column({ type: "uuid", name: "preferredTrainerId", nullable: true })
  preferredTrainerId?: string | null;

  @ManyToOne(() => Trainer, { nullable: true })
  @JoinColumn({ name: "preferredTrainerId" })
  preferredTrainer?: Trainer | null;

  @Column({ type: "date", nullable: false })
  preferredDate: Date;

  @Column({ type: "time", nullable: false })
  preferredTime: string;

  @Column({ type: "enum", enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @Column({ type: "text", nullable: true })
  notes: string;
}
