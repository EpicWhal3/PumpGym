import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { AuthenticatedUser } from "../interfaces/authenticated-user.interface";

export const CurrentUser = createParamDecorator(
  (
    _data: unknown,
    context: ExecutionContext,
  ): AuthenticatedUser | undefined => {
    if (context.getType<string>() === "http") {
      return context.switchToHttp().getRequest().user;
    }

    const gqlContext = GqlExecutionContext.create(context);
    return gqlContext.getContext().req?.user;
  },
);
