import {Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./user.entity";
import {Tariff} from "./tariff.entity";

export enum TariffState {
    ACTIVE = 'ACTIVE',
    EXPIRED = 'EXPIRED',
    SUSPENDED = 'SUSPENDED'
}

@Entity('user_tariffs')
export class UserTariff {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, (user) => user.tariff)
    @JoinColumn({name: 'userId'})
    userId: string;

    @ManyToOne(() => Tariff,
        (tariff) => tariff.userTariffs)
    @JoinColumn({name: 'tariffId'})
    tariff: Tariff;

    @Column({type: 'timestamp'})
    startDate: Date;

    @Column({type: 'timestamp'})
    endDate: Date;

    @Column({type: 'enum', enum: TariffState, default: TariffState.ACTIVE})
    status: TariffState;

    @CreateDateColumn({type: 'timestamp'})
    createdAt: Date;
}
