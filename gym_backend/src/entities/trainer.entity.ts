import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { TimetableEntry } from "./timetable-entry.entity";
import { User } from "./user.entity";

@Entity("trainers")
export class Trainer {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  userId: string;

  @OneToOne(() => User, (user) => user.trainer)
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ type: "simple-array" })
  specialty: string[];

  @Column({ type: "varchar", length: 30, nullable: true })
  experience: string;

  @Column({ type: "text", nullable: true })
  bio: string;

  @Column({ type: "decimal", precision: 3, scale: 2, nullable: true })
  rating: number;

  @Column({ type: "int", default: 0 })
  reviews: number;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @OneToMany(() => TimetableEntry, (entry) => entry.trainer)
  timetableEntries: TimetableEntry[];
}
