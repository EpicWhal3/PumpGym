import { CreateUserDto } from "./create-user.dto";
import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({ description: "ID пользователя (для обновления)" })
  id?: string;
}
