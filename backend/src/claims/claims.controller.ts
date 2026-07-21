import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { PERMISSIONS } from "../common/constants/permissions";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Permissions } from "../common/decorators/permissions.decorator";
import type { AuthenticatedUser } from "../common/interfaces/authenticated-user.interface";
import { requireCompanyId } from "../common/utils/tenant";
import { ClaimsService } from "./claims.service";
import { CreateClaimDto } from "./dto/create-claim.dto";
import { UpdateClaimDto } from "./dto/update-claim.dto";

@Controller("claims")
@Permissions(PERMISSIONS.CLAIMS_MANAGE)
export class ClaimsController {
  constructor(private readonly service: ClaimsService) {}
  @Get() list(@CurrentUser() user: AuthenticatedUser) { return this.service.list(requireCompanyId(user)); }
  @Get(":id") findOne(@CurrentUser() user: AuthenticatedUser, @Param("id", ParseIntPipe) id: number) { return this.service.findOne(requireCompanyId(user), id); }
  @Post() create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateClaimDto) { return this.service.create(requireCompanyId(user), dto); }
  @Patch(":id") update(@CurrentUser() user: AuthenticatedUser, @Param("id", ParseIntPipe) id: number, @Body() dto: UpdateClaimDto) { return this.service.update(requireCompanyId(user), id, dto); }
  @Delete(":id") remove(@CurrentUser() user: AuthenticatedUser, @Param("id", ParseIntPipe) id: number) { return this.service.remove(requireCompanyId(user), id); }
}
