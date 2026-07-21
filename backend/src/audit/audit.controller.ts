import { Controller, Get, Query } from "@nestjs/common";
import { PERMISSIONS } from "../common/constants/permissions";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Permissions } from "../common/decorators/permissions.decorator";
import type { AuthenticatedUser } from "../common/interfaces/authenticated-user.interface";
import { requireCompanyId } from "../common/utils/tenant";
import { AuditService } from "./audit.service";

@Controller("audit")
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  @Permissions(PERMISSIONS.AUDIT_READ)
  @Get()
  list(@CurrentUser() user: AuthenticatedUser, @Query("take") take?: string) {
    return this.audit.list(requireCompanyId(user), Number(take || 100));
  }
}
