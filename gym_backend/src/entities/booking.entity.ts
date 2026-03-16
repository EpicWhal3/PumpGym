import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./user.entity";

export enum ServiceType {
  TRIAL = "trial",
  CONSULTATION = "consultation",
  PERSONAL = "personal",
  GROUP = "group",
}

export enum BookingStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
}

@Entity("bookings")
export class Booking {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, (user) => user.bookings, { nullable: false })
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

  @Column({ type: "date", nullable: false })
  preferredDate: Date;

  @Column({ type: "time", nullable: false })
  preferredTime: string;

  @Column({ type: "enum", enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @Column({ type: "text" })
  notes: string;
}
