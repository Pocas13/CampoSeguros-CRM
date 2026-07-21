import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from "@nestjs/common";
import { ImportSource, IntegrationEnvironment } from "@prisma/client";
import { PERMISSIONS } from "../common/constants/permissions";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Permissions } from "../common/decorators/permissions.decorator";
import type { AuthenticatedUser } from "../common/interfaces/authenticated-user.interface";
import { requireCompanyId } from "../common/utils/tenant";
import { SaveIntegrationDto } from "./dto/save-integration.dto";
import { StartPortfolioImportDto } from "./dto/start-portfolio-import.dto";
import { UpdateOrganizationInsurerDto } from "./dto/update-organization-insurer.dto";
import { IntegrationsService } from "./integrations.service";

@Controller("integrations")
export class IntegrationsController {
  constructor(private readonly service: IntegrationsService) {}

  @Permissions(PERMISSIONS.INTEGRATIONS_MANAGE)
  @Get("status")
  status(@CurrentUser() user: AuthenticatedUser) {
    return this.service.status(requireCompanyId(user));
  }

  @Permissions(PERMISSIONS.INTEGRATIONS_MANAGE)
  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.service.list(requireCompanyId(user));
  }

  @Permissions(PERMISSIONS.INTEGRATIONS_MANAGE)
  @Patch("insurers/:insurerId/settings")
  updateOrganizationInsurer(
    @CurrentUser() user: AuthenticatedUser,
    @Param("insurerId", ParseIntPipe) insurerId: number,
    @Body() dto: UpdateOrganizationInsurerDto,
  ) {
    return this.service.updateOrganizationInsurer(requireCompanyId(user), insurerId, dto);
  }

  @Permissions(PERMISSIONS.INTEGRATIONS_MANAGE)
  @Post("insurers/:insurerId/configuration")
  saveIntegration(
    @CurrentUser() user: AuthenticatedUser,
    @Param("insurerId", ParseIntPipe) insurerId: number,
    @Body() dto: SaveIntegrationDto,
  ) {
    return this.service.saveIntegration(requireCompanyId(user), insurerId, dto);
  }

  @Permissions(PERMISSIONS.INTEGRATIONS_MANAGE)
  @Post("insurers/:insurerId/test")
  test(
    @CurrentUser() user: AuthenticatedUser,
    @Param("insurerId", ParseIntPipe) insurerId: number,
    @Query("environment") environment?: IntegrationEnvironment,
  ) {
    return this.service.testIntegration(requireCompanyId(user), insurerId, environment || IntegrationEnvironment.SANDBOX);
  }

  @Permissions(PERMISSIONS.PORTFOLIO_IMPORT)
  @Get("portfolio-imports")
  imports(@CurrentUser() user: AuthenticatedUser) {
    return this.service.listImports(requireCompanyId(user));
  }

  @Permissions(PERMISSIONS.PORTFOLIO_IMPORT)
  @Post("portfolio-imports/demo")
  demoImport(@CurrentUser() user: AuthenticatedUser, @Body() body: { insurerId?: number }) {
    return this.service.startPortfolioImport(requireCompanyId(user), body.insurerId || null, user.id, { source: ImportSource.DEMO });
  }

  @Permissions(PERMISSIONS.PORTFOLIO_IMPORT)
  @Post("insurers/:insurerId/portfolio-imports")
  startImport(
    @CurrentUser() user: AuthenticatedUser,
    @Param("insurerId", ParseIntPipe) insurerId: number,
    @Body() dto: StartPortfolioImportDto,
  ) {
    return this.service.startPortfolioImport(requireCompanyId(user), insurerId, user.id, dto);
  }
}
