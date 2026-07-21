import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { PERMISSIONS } from "../common/constants/permissions";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Permissions } from "../common/decorators/permissions.decorator";
import type { AuthenticatedUser } from "../common/interfaces/authenticated-user.interface";
import { requireCompanyId } from "../common/utils/tenant";
import { CreatePolicyDto } from "./dto/create-policy.dto";
import { UpdatePolicyDto } from "./dto/update-policy.dto";
import { PoliciesService } from "./policies.service";

@Controller("policies")
export class PoliciesController {
  constructor(private readonly service: PoliciesService) {}
  @Permissions(PERMISSIONS.POLICIES_READ) @Get() findAll(@CurrentUser() user: AuthenticatedUser) { return this.service.findAll(requireCompanyId(user)); }
  @Permissions(PERMISSIONS.POLICIES_READ) @Get(":id") findOne(@CurrentUser() user: AuthenticatedUser, @Param("id", ParseIntPipe) id: number) { return this.service.findOne(id, requireCompanyId(user)); }
  @Permissions(PERMISSIONS.POLICIES_WRITE) @Post() create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreatePolicyDto) { return this.service.create(dto, requireCompanyId(user)); }
  @Permissions(PERMISSIONS.POLICIES_WRITE) @Patch(":id") update(@CurrentUser() user: AuthenticatedUser, @Param("id", ParseIntPipe) id: number, @Body() dto: UpdatePolicyDto) { return this.service.update(id, dto, requireCompanyId(user)); }
  @Permissions(PERMISSIONS.POLICIES_WRITE) @Post(":id/documents") addDocument(@CurrentUser() user: AuthenticatedUser, @Param("id", ParseIntPipe) id: number, @Body() dto: { name: string; type?: string; fileName?: string; url?: string; notes?: string }) { return this.service.addDocument(id, dto, requireCompanyId(user)); }
  @Permissions(PERMISSIONS.POLICIES_WRITE) @Delete("documents/:documentId") removeDocument(@CurrentUser() user: AuthenticatedUser, @Param("documentId", ParseIntPipe) documentId: number) { return this.service.removeDocument(documentId, requireCompanyId(user)); }
  @Permissions(PERMISSIONS.POLICIES_DELETE) @Delete(":id") remove(@CurrentUser() user: AuthenticatedUser, @Param("id", ParseIntPipe) id: number) { return this.service.remove(id, requireCompanyId(user)); }
}
