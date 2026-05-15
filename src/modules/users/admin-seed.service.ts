import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { User } from "../../entities";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { UserRole } from "../../common/enums/user-roles.enum";

@Injectable()
export class AdminSeedService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit(){
    const adminEmail = this.configService.get<string>("ADMIN_EMAIL");
    const adminPassword = this.configService.get<string>("ADMIN_PASSWORD");

    if (!adminEmail || !adminPassword) {
      return;
    }

    const existingAdmin = await this.usersRepository.findOne({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = this.usersRepository.create({
      name: this.configService.get<string>("ADMIN_NAME", "Admin"),
      email: adminEmail,
      phone: this.configService.get<string>("ADMIN_PHONE", "+79990000000"),
      password: hashedPassword,
      role: UserRole.ADMIN,
      isActive: true,
    });

    await this.usersRepository.save(admin);
    console.log(`Admin user created: ${adminEmail}`);
  }
}