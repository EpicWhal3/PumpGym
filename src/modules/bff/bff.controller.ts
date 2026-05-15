import { Controller, Get, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { BffService } from "./bff.service";

@ApiTags("bff")
@Controller("bff")
export class BffController {
  constructor(private readonly bffService: BffService) {}

  @Public()
  @Get("schedule")
  @ApiOperation({ summary: "BFF-эндпоинт расписания с кэшем" })
  getSchedule(
    @Query("date") date?: string,
    @Query("trainerId") trainerId?: string,
    @Query("type") type?: string,
    @Query("hall") hall?: string,
  ) {
    return this.bffService.getSchedule({ date, trainerId, type, hall });
  }
}
