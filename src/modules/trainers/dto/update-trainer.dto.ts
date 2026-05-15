import { CreateTrainerDto } from "./create-trainer.dto";
import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";

export class UpdateTrainerDto extends PartialType(CreateTrainerDto) {
  @ApiPropertyOptional({ description: "ID тренера (для обновления)" })
  id?: string;
}
