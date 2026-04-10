import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { Public } from "../../common/decorators/public.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("register")
  @ApiOperation({ summary: "Регистрация пользователя" })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post("login")
  @ApiOperation({ summary: "Вход по email и паролю" })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get("me")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Получить текущего пользователя" })
  me(@CurrentUser() user: { id: string }) {
    return this.authService.validateUserById(user.id);
  }
}
