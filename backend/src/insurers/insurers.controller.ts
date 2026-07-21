import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import type { AuthenticatedUser } from "../common/interfaces/authenticated-user.interface";
import { requireCompanyId } from "../common/utils/tenant";
import { CreateInsurerDto, InsurerContactDto } from "./dto/create-insurer.dto";
import { UpdateInsurerDto } from "./dto/update-insurer.dto";
import { InsurersService } from "./insurers.service";

@Controller("insurers")
export class InsurersController {
  constructor(private readonly service: InsurersService) {}
  @Get() findAll(@CurrentUser() user: AuthenticatedUser) { return this.service.findAll(requireCompanyId(user)); }
  @Get(":id") findOne(@CurrentUser() user: AuthenticatedUser, @Param("id", ParseIntPipe) id: number) { return this.service.findOne(id, requireCompanyId(user)); }
  @Roles(UserRole.SUPER_ADMIN) @Post() create(@Body() dto: CreateInsurerDto) { return this.service.create(dto); }
  @Roles(UserRole.SUPER_ADMIN) @Patch(":id") update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateInsurerDto) { return this.service.update(id, dto); }
  @Roles(UserRole.SUPER_ADMIN) @Post(":id/contacts") addContact(@Param("id", ParseIntPipe) id: number, @Body() dto: InsurerContactDto) { return this.service.addContact(id, dto); }
  @Roles(UserRole.SUPER_ADMIN) @Delete("contacts/:id") removeContact(@Param("id", ParseIntPipe) id: number) { return this.service.removeContact(id); }
  @Roles(UserRole.SUPER_ADMIN) @Delete(":id") remove(@Param("id", ParseIntPipe) id: number) { return this.service.remove(id); }
}
