import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { Roles } from "../common/decorators/roles.decorator";
import { CreateOrganizationDto } from "./dto/create-organization.dto";
import { UpdateOrganizationPlanDto } from "./dto/update-organization-plan.dto";
import { PlatformService } from "./platform.service";

@Roles(UserRole.SUPER_ADMIN)
@Controller("platform")
export class PlatformController {
  constructor(private readonly service: PlatformService) {}
  @Get("organizations") list() { return this.service.listOrganizations(); }
  @Post("organizations") create(@Body() dto: CreateOrganizationDto) { return this.service.createOrganization(dto); }
  @Patch("organizations/:id") update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateOrganizationPlanDto) { return this.service.updateOrganization(id, dto); }
}
