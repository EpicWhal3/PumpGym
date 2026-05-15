import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { User } from "../../entities";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { UserRole } from "../../common/enums/user-roles.enum";

@Injectable()
export class AdminSeedService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    const adminEmail = this.configService.get<string>("ADMIN_EMAIL");
    const adminPassword = this.configService.get<string>("ADMIN_PASSWORD");
    const adminName = this.configService.get<string>("ADMIN_NAME", "Admin");
    const adminPhone = this.configService.get<string>(
      "ADMIN_PHONE",
      "+79990000000",
    );

    if (!adminEmail || !adminPassword) {
      console.log("ADMIN_EMAIL or ADMIN_PASSWORD is missing");
      return;
    }

    const existingAdmin = await this.usersRepository.findOne({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log("Admin already exists, updating password/role");

      existingAdmin.name = adminName;
      existingAdmin.phone = adminPhone;
      existingAdmin.role = UserRole.ADMIN;
      existingAdmin.isActive = true;
      existingAdmin.password = await bcrypt.hash(adminPassword, 10);

      await this.usersRepository.save(existingAdmin);
      console.log(`Admin updated: ${adminEmail}`);
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = this.usersRepository.create({
      name: adminName,
      email: adminEmail,
      phone: adminPhone,
      password: hashedPassword,
      role: UserRole.ADMIN,
      isActive: true,
    });

    await this.usersRepository.save(admin);
    console.log(`Admin user created: ${adminEmail}`);
  }
}
