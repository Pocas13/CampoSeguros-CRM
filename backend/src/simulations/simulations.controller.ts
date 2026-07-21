import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { PERMISSIONS } from "../common/constants/permissions";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Permissions } from "../common/decorators/permissions.decorator";
import type { AuthenticatedUser } from "../common/interfaces/authenticated-user.interface";
import { requireCompanyId } from "../common/utils/tenant";
import { CreateSimulationDto } from "./dto/create-simulation.dto";
import { UpdateSimulationDto } from "./dto/update-simulation.dto";
import { SimulationsService } from "./simulations.service";

@Controller("simulations")
export class SimulationsController {
  constructor(private readonly service: SimulationsService) {}
  @Permissions(PERMISSIONS.QUOTES_WRITE) @Post() create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateSimulationDto) { return this.service.create(dto, requireCompanyId(user)); }
  @Permissions(PERMISSIONS.QUOTES_READ) @Get() findAll(@CurrentUser() user: AuthenticatedUser) { return this.service.findAll(requireCompanyId(user)); }
  @Permissions(PERMISSIONS.QUOTES_READ) @Get(":id") findOne(@CurrentUser() user: AuthenticatedUser, @Param("id", ParseIntPipe) id: number) { return this.service.findOne(id, requireCompanyId(user)); }
  @Permissions(PERMISSIONS.QUOTES_WRITE) @Patch(":id") update(@CurrentUser() user: AuthenticatedUser, @Param("id", ParseIntPipe) id: number, @Body() dto: UpdateSimulationDto) { return this.service.update(id, dto, requireCompanyId(user)); }
  @Permissions(PERMISSIONS.QUOTES_WRITE) @Delete(":id") remove(@CurrentUser() user: AuthenticatedUser, @Param("id", ParseIntPipe) id: number) { return this.service.remove(id, requireCompanyId(user)); }
}
