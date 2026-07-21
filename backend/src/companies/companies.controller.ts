import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { PERMISSIONS } from "../common/constants/permissions";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Permissions } from "../common/decorators/permissions.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import type { AuthenticatedUser } from "../common/interfaces/authenticated-user.interface";
import { requireCompanyId } from "../common/utils/tenant";
import { CompaniesService } from "./companies.service";
import { CreateCompanyDto } from "./dto/create-company.dto";
import { UpdateCompanyDto } from "./dto/update-company.dto";

@Controller("companies")
export class CompaniesController {
  constructor(private readonly service: CompaniesService) {}
  @Get("current") current(@CurrentUser() user: AuthenticatedUser) { return this.service.findOne(requireCompanyId(user)); }
  @Permissions(PERMISSIONS.ORGANIZATION_MANAGE) @Patch("current") updateCurrent(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateCompanyDto) { return this.service.update(requireCompanyId(user), dto); }
  @Roles(UserRole.SUPER_ADMIN) @Post() create(@Body() dto: CreateCompanyDto) { return this.service.create(dto); }
  @Roles(UserRole.SUPER_ADMIN) @Get() findAll() { return this.service.findAll(); }
  @Roles(UserRole.SUPER_ADMIN) @Get(":id") findOne(@Param("id", ParseIntPipe) id: number) { return this.service.findOne(id); }
  @Roles(UserRole.SUPER_ADMIN) @Patch(":id") update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateCompanyDto) { return this.service.update(id, dto); }
  @Roles(UserRole.SUPER_ADMIN) @Delete(":id") remove(@Param("id", ParseIntPipe) id: number) { return this.service.remove(id); }
}
