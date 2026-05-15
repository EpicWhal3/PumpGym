import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { BffService } from "./bff.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { UserRole } from "../../common/enums/user-roles.enum";
import { Public } from "../../common/decorators/public.decorator";

@Controller("bff")
export class BffController {
  constructor(private readonly bffService: BffService) {}

  @Public()
  @Get("schedule")
  async getSchedule(@Query("date") date?: string) {
    return this.bffService.getSchedule(date);
  }

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  async getProfile(@Req() req: any) {
    return this.bffService.getProfile(req.user.id);
  }

  @Public()
  @Get("home")
  async getHome() {
    return this.bffService.getHome();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get("admin/dashboard")
  async getAdminDashboard() {
    return this.bffService.getAdminDashboard();
  }
}
