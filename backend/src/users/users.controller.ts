import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { PERMISSIONS } from "../common/constants/permissions";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Permissions } from "../common/decorators/permissions.decorator";
import type { AuthenticatedUser } from "../common/interfaces/authenticated-user.interface";
import { requireCompanyId } from "../common/utils/tenant";
import { CreateUserDto } from "./dto/create-user.dto";
import { InviteUserDto } from "./dto/invite-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly service: UsersService) {}
  @Get("directory") directory(@CurrentUser() user: AuthenticatedUser) { return this.service.directory(requireCompanyId(user)); }
  @Permissions(PERMISSIONS.USERS_MANAGE) @Get() list(@CurrentUser() user: AuthenticatedUser) { return this.service.list(requireCompanyId(user)); }
  @Permissions(PERMISSIONS.USERS_MANAGE) @Post() create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateUserDto) { return this.service.createForCompany(requireCompanyId(user), dto); }
  @Permissions(PERMISSIONS.USERS_MANAGE) @Patch(":id") update(@CurrentUser() user: AuthenticatedUser, @Param("id", ParseIntPipe) id: number, @Body() dto: UpdateUserDto) { return this.service.updateForCompany(requireCompanyId(user), id, dto); }
  @Permissions(PERMISSIONS.USERS_MANAGE) @Get("invitations") invitations(@CurrentUser() user: AuthenticatedUser) { return this.service.listInvitations(requireCompanyId(user)); }
  @Permissions(PERMISSIONS.USERS_MANAGE) @Post("invitations") invite(@CurrentUser() user: AuthenticatedUser, @Body() dto: InviteUserDto) { return this.service.createInvitation(requireCompanyId(user), user.id, dto); }
  @Permissions(PERMISSIONS.USERS_MANAGE) @Delete("invitations/:id") cancelInvite(@CurrentUser() user: AuthenticatedUser, @Param("id", ParseIntPipe) id: number) { return this.service.cancelInvitation(requireCompanyId(user), id); }
  @Permissions(PERMISSIONS.USERS_MANAGE) @Delete(":id") deactivate(@CurrentUser() user: AuthenticatedUser, @Param("id", ParseIntPipe) id: number) { return this.service.deactivate(requireCompanyId(user), id, user.id); }
}
