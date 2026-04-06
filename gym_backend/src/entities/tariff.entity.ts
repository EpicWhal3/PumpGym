import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserTariff } from "./user-tariff.entity";
import { TariffType } from "../common/enums/tariff-types.enum";

@Entity("tariff")
export class Tariff {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "enum", enum: TariffType, default: TariffType.LITE })
  type: TariffType;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "int" })
  price: number;

  @Column({ type: "int" })
  duration: number;

  @Column("simple-array")
  features: string[];

  @Column({ type: "jsonb", nullable: true })
  restrictions: {
    timeOfDay?: "10:00-18:00" | "any";
  };

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @OneToMany(() => UserTariff, (userSub) => userSub.tariff)
  userTariffs: UserTariff[];
}
