import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { PERMISSIONS } from "../common/constants/permissions";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Permissions } from "../common/decorators/permissions.decorator";
import type { AuthenticatedUser } from "../common/interfaces/authenticated-user.interface";
import { requireCompanyId } from "../common/utils/tenant";
import { ClientsService } from "./clients.service";
import { CreateClientDto } from "./dto/create-client.dto";
import { UpdateClientDto } from "./dto/update-client.dto";

@Controller("clients")
export class ClientsController {
  constructor(private readonly service: ClientsService) {}
  @Permissions(PERMISSIONS.CLIENTS_WRITE) @Post() create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateClientDto) { return this.service.create(dto, requireCompanyId(user)); }
  @Permissions(PERMISSIONS.CLIENTS_READ) @Get() findAll(@CurrentUser() user: AuthenticatedUser) { return this.service.findAll(requireCompanyId(user)); }
  @Permissions(PERMISSIONS.CLIENTS_READ) @Get(":id") findOne(@CurrentUser() user: AuthenticatedUser, @Param("id", ParseIntPipe) id: number) { return this.service.findOne(id, requireCompanyId(user)); }
  @Permissions(PERMISSIONS.CLIENTS_WRITE) @Patch(":id") update(@CurrentUser() user: AuthenticatedUser, @Param("id", ParseIntPipe) id: number, @Body() dto: UpdateClientDto) { return this.service.update(id, dto, requireCompanyId(user)); }
  @Permissions(PERMISSIONS.CLIENTS_DELETE) @Delete(":id") remove(@CurrentUser() user: AuthenticatedUser, @Param("id", ParseIntPipe) id: number) { return this.service.remove(id, requireCompanyId(user)); }
}
