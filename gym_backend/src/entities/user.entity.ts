import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { Booking } from "./booking.entity";
import { UserTariff } from "./user-tariff.entity";
import { ClassEnrollment } from "./class-enrollment.entity";
import { UserRole } from "../common/enums/user-roles.enum";
import { Trainer } from "./trainer.entity";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 100, nullable: false })
  name: string;

  @Column({ type: "varchar", length: 100, nullable: false, unique: true })
  email: string;

  @Column({ type: "varchar", length: 100, nullable: false, unique: true })
  phone: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.CLIENT,
  })
  role: UserRole;

  @Column({ type: "varchar", length: 255, nullable: true })
  password: string;

  @Column({ type: "varchar", length: 512, nullable: true })
  photoUrl: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  registrationDate: Date;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @OneToMany(() => Booking, (booking) => booking.user)
  bookings: Booking[];

  @OneToMany(() => UserTariff, (userTariff) => userTariff.user, {
    nullable: true,
  })
  tariffs: UserTariff[];

  @OneToMany(() => ClassEnrollment, (enrollment) => enrollment.user)
  enrollments: ClassEnrollment[];

  @OneToOne(() => Trainer, (trainer) => trainer.user, { nullable: true })
  trainer?: Trainer;
}
