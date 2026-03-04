import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {UserSubscription} from "./user-tariff.entity";

export enum SubscriptionType {
    LITE = 'LITE',
    PRO = 'PRO',
    UNLIMITED = 'UNLIMITED'
}

@Entity('subscription')
export class Subscription {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({type: 'enum', enum: SubscriptionType, default: SubscriptionType.LITE})
    type: SubscriptionType;

    @Column({type: 'text', nullable: true})
    description: string;

    @Column({type: 'int'})
    price: number;

    @Column({type: 'int'})
    duration: number;

    @Column('simple-array')
    features: string[];

    @Column({type: 'jsonb', nullable: true})
    restrictions: {
        timeOfDay?: '10:00-18:00' | 'any';
        sessionsPerMonth?: number;
    };

    @Column({type: 'boolean', default: true})
    isActive: boolean;

    @OneToMany(() => UserSubscription, (userSub) => userSub.subscription)
    userSubscriptions: UserSubscription[];
}