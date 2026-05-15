import { ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";

export function getRequestFromContext(context: ExecutionContext) {
  if (context.getType<string>() === "http") {
    return context.switchToHttp().getRequest();
  }

  const gqlContext = GqlExecutionContext.create(context);
  return gqlContext.getContext().req;
}
