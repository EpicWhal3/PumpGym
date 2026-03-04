import {Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./user.entity";
import {Subscription} from "./tariff.entity";

export enum SubscriptionState {
    ACTIVE = 'ACTIVE',
    EXPIRED = 'EXPIRED',
    SUSPENDED = 'SUSPENDED'
}

@Entity('user_subscriptions')
export class UserSubscription {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, (user) => user.subscription)
    @JoinColumn({name: 'userId'})
    userId: string;

    @ManyToOne(() => Subscription,
        (subscription) => subscription.userSubscriptions)
    @JoinColumn({name: 'subscriptionId'})
    subscription: Subscription;

    @Column({type: 'timestamp'})
    startDate: Date;

    @Column({type: 'timestamp'})
    endDate: Date;

    @Column({type: 'enum', enum: SubscriptionState, default: SubscriptionState.ACTIVE})
    status: SubscriptionState;

    @CreateDateColumn({type: 'timestamp'})
    createdAt: Date;
}
