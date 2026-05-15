import { Args, Field, Mutation, ObjectType, Resolver } from "@nestjs/graphql";
import { AuthService } from "../../modules/auth/auth.service";
import { Public } from "../../common/decorators/public.decorator";
import { UserType } from "../types/user.type";
import { LoginDto } from "../../modules/auth/dto/login.dto";
import { RegisterDto } from "../../modules/auth/dto/register.dto";

@ObjectType()
class AuthPayloadType {
  @Field()
  accessToken: string;

  @Field(() => UserType)
  user: UserType;
}

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Mutation(() => AuthPayloadType, { name: "register" })
  register(
    @Args("name") name: string,
    @Args("email") email: string,
    @Args("phone") phone: string,
    @Args("password") password: string,
    @Args("photoUrl", { nullable: true }) photoUrl?: string,
  ) {
    const dto: RegisterDto = { name, email, phone, password, photoUrl };
    return this.authService.register(dto);
  }

  @Public()
  @Mutation(() => AuthPayloadType, { name: "login" })
  login(@Args("email") email: string, @Args("password") password: string) {
    const dto: LoginDto = { email, password };
    return this.authService.login(dto);
  }
}
