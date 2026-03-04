import {Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {TimetableEntry} from "./timetable-entry.entity";
import {User} from "./user.entity";

export enum EnrollmentStatus {
    CONFIRMED = 'confirmed',
    CANCELLED = 'cancelled',
    ATTENDED = 'attended'
}

@Entity('class_enrollments')
export class ClassEnrollment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, (user) => user.enrollments)
    @JoinColumn({name: 'userId'})
    user: User;

    @ManyToOne(() => TimetableEntry, (entry) => entry.enrollments)
    @JoinColumn({name: 'timetableEntryId'})
    timetableEntry: TimetableEntry;

    @CreateDateColumn({type: 'timestamp'})
    createdAt: Date;

    @Column({type: 'enum', enum: EnrollmentStatus, default: EnrollmentStatus.CONFIRMED})
    status: EnrollmentStatus;
}
