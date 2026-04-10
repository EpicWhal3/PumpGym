import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { getRequestFromContext } from "../graphql/gql-context.util";
import { UsersService } from "../../modules/users/users.service";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = getRequestFromContext(context);
    const authHeader = request?.headers?.authorization as string | undefined;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Требуется Bearer token");
    }

    const token = authHeader.slice(7);

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>("JWT_SECRET", "dev-secret"),
      });

      const user = await this.usersService.findAuthUserById(payload.sub);
      request.user = {
        id: user.id,
        email: user.email,
        role: user.role,
      };

      return true;
    } catch {
      throw new UnauthorizedException("Неверный или просроченный токен");
    }
  }
}
