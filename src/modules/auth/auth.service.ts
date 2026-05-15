import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { UsersService } from "../users/users.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { UserRole } from "../../common/enums/user-roles.enum";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const password = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      ...dto,
      password,
      role: UserRole.USER,
      isActive: true,
    });

    return this.buildAuthResponse(user.id, user.email, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmailWithPassword(dto.email);

    if (!user || !user.password) {
      throw new UnauthorizedException("Неверный email или пароль");
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException("Неверный email или пароль");
    }

    return this.buildAuthResponse(user.id, user.email, user.role);
  }

  async validateUserById(userId: string) {
    return this.usersService.findAuthUserById(userId);
  }

  private async buildAuthResponse(id: string, email: string, role: UserRole) {
    const accessToken = await this.jwtService.signAsync({
      sub: id,
      email,
      role,
    });

    return {
      accessToken,
      user: await this.usersService.findOne(id),
    };
  }
}
