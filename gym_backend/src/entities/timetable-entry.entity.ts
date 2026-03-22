import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Trainer } from "./trainer.entity";
import { ClassEnrollment } from "./class-enrollment.entity";
import { EntryStatus } from "../common/enums/entry-status.enum";
import { WorkoutType } from "../common/enums/workout-types.enum";

@Entity("timetable_entries")
export class TimetableEntry {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "enum", enum: WorkoutType })
  type: WorkoutType;

  @Column({ type: "uuid", name: "trainerId" })
  trainerId: string;

  @ManyToOne(() => Trainer, (trainer) => trainer.timetableEntries)
  @JoinColumn({ name: "trainerId" })
  trainer: Trainer;

  @Column({ type: "varchar", length: 30, nullable: false })
  hall: string;

  @Column({ type: "date", nullable: false })
  date: Date;

  @Column({ type: "time", nullable: false })
  startTime: string;

  @Column({ type: "time", nullable: false })
  endTime: string;

  @Column({ type: "int", nullable: false })
  capacity: number;

  @Column({ type: "int", default: 0 })
  enrolled: number;

  @Column({ type: "enum", enum: EntryStatus, default: EntryStatus.AVAILABLE })
  status: EntryStatus;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @OneToMany(() => ClassEnrollment, (enrollment) => enrollment.timetableEntry)
  enrollments: ClassEnrollment[];
}
