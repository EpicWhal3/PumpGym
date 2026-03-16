import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { TimetableEntry } from "./timetable-entry.entity";

@Entity("trainers")
export class Trainer {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 100, nullable: false })
  name: string;

  @Column({ type: "simple-array" })
  specialty: string[];

  @Column({ type: "varchar", length: 30, nullable: true })
  experience: string;

  @Column({ type: "text", nullable: true })
  bio: string;

  @Column({ type: "varchar", length: 512, nullable: true })
  photoUrl: string;

  @Column({ type: "decimal", precision: 3, scale: 2, nullable: true })
  rating: number;

  @Column({ type: "int", default: 0 })
  reviews: number;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @OneToMany(() => TimetableEntry, (entry) => entry.trainer)
  timetableEntries: TimetableEntry[];
}
