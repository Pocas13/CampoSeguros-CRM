import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ImportSource, ImportStatus, IntegrationEnvironment, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { DemoInsurerConnector } from "./connectors/demo.connector";
import { ManualInsurerConnector } from "./connectors/manual.connector";
import type { InsurerConnector, PortfolioRecord } from "./connectors/insurer-connector.interface";
import { SaveIntegrationDto } from "./dto/save-integration.dto";
import { StartPortfolioImportDto } from "./dto/start-portfolio-import.dto";
import { UpdateOrganizationInsurerDto } from "./dto/update-organization-insurer.dto";
import { EncryptionService } from "./encryption.service";

@Injectable()
export class IntegrationsService {
  private readonly manual = new ManualInsurerConnector();
  private readonly demo = new DemoInsurerConnector();

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly encryption: EncryptionService,
  ) {}

  async status(companyId: number) {
    const vehicleProvider = this.configService.get<string>("VEHICLE_LOOKUP_PROVIDER", "demo").toLowerCase();
    const [active, configured, imports] = await Promise.all([
      this.prisma.insurerIntegration.count({ where: { companyId, status: "ACTIVE" } }),
      this.prisma.insurerIntegration.count({ where: { companyId, status: { in: ["CONFIGURED", "TESTING", "ACTIVE"] } } }),
      this.prisma.portfolioImportJob.count({ where: { companyId } }),
    ]);
    return {
      insurerConnectors: {
        architectureReady: true,
        productionConnectors: active,
        configuredConnectors: configured,
        defaultMode: "MANUAL",
        portfolioImports: imports,
        directPortfolioImportReady: true,
        message: "A carteira pode ser importada diretamente quando a companhia disponibiliza API/webservice de carteira e autoriza a mediadora. O mesmo conector é reutilizado por todas as mediadoras; apenas as credenciais e o código de agente são diferentes.",
      },
      vehicleLookup: {
        provider: vehicleProvider,
        configured: vehicleProvider === "custom" && Boolean(this.configService.get<string>("VEHICLE_LOOKUP_API_URL")),
        registrationPrimary: true,
        firstRegistrationDateOptional: true,
        vinOptional: true,
      },
    };
  }

  async list(companyId: number) {
    const insurers = await this.prisma.insurer.findMany({
      where: { active: true },
      include: {
        organizations: { where: { companyId } },
        integrations: { where: { companyId }, orderBy: { environment: "asc" } },
      },
      orderBy: [{ commercialName: "asc" }, { name: "asc" }],
    });
    return insurers.map((insurer) => ({
      ...insurer,
      organizationSettings: insurer.organizations[0] || null,
      organizations: undefined,
      integrations: insurer.integrations.map((integration) => ({
        ...integration,
        encryptedConfig: undefined,
        encryptedSecret: undefined,
        hasCredentials: Boolean(integration.encryptedSecret || integration.encryptedConfig),
      })),
    }));
  }

  async updateOrganizationInsurer(companyId: number, insurerId: number, dto: UpdateOrganizationInsurerDto) {
    await this.ensureInsurer(insurerId);
    const data = this.cleanObject(dto);
    return this.prisma.organizationInsurer.upsert({
      where: { companyId_insurerId: { companyId, insurerId } },
      create: { companyId, insurerId, ...data },
      update: data,
      include: { insurer: true },
    });
  }

  async saveIntegration(companyId: number, insurerId: number, dto: SaveIntegrationDto) {
    await this.ensureInsurer(insurerId);
    const existing = await this.prisma.insurerIntegration.findUnique({
      where: { companyId_insurerId_environment: { companyId, insurerId, environment: dto.environment } },
    });
    const encryptedConfig = dto.config ? this.encryption.encrypt(dto.config) : existing?.encryptedConfig;
    const encryptedSecret = dto.secret ? this.encryption.encrypt({ secret: dto.secret }) : existing?.encryptedSecret;
    const integration = await this.prisma.insurerIntegration.upsert({
      where: { companyId_insurerId_environment: { companyId, insurerId, environment: dto.environment } },
      create: {
        companyId,
        insurerId,
        mode: dto.mode,
        environment: dto.environment,
        status: dto.status || "CONFIGURED",
        agencyCode: dto.agencyCode?.trim() || null,
        username: dto.username?.trim() || null,
        encryptedConfig,
        encryptedSecret,
        capabilities: (dto.capabilities || {}) as Prisma.InputJsonValue,
      },
      update: {
        mode: dto.mode,
        status: dto.status || "CONFIGURED",
        agencyCode: dto.agencyCode?.trim() || null,
        username: dto.username?.trim() || null,
        encryptedConfig,
        encryptedSecret,
        capabilities: (dto.capabilities || {}) as Prisma.InputJsonValue,
        lastError: null,
      },
      include: { insurer: true },
    });
    return this.safeIntegration(integration);
  }

  async testIntegration(companyId: number, insurerId: number, environment: IntegrationEnvironment) {
    const integration = await this.prisma.insurerIntegration.findUnique({
      where: { companyId_insurerId_environment: { companyId, insurerId, environment } },
      include: { insurer: true },
    });
    if (!integration) throw new NotFoundException("Integração não configurada.");
    const connector = this.resolveConnector(integration.mode === "MANUAL" ? "MANUAL" : integration.insurer.asfCode || integration.insurer.name);
    const credentials = this.credentials(integration);
    const result = connector.testConnection
      ? await connector.testConnection(credentials)
      : { ok: false, message: "O conector desta companhia ainda não implementa teste automático." };
    const updated = await this.prisma.insurerIntegration.update({
      where: { id: integration.id },
      data: {
        status: result.ok ? (integration.mode === "MANUAL" ? "CONFIGURED" : "ACTIVE") : "ERROR",
        lastTestedAt: new Date(),
        lastError: result.ok ? null : result.message,
      },
      include: { insurer: true },
    });
    return { ...this.safeIntegration(updated), test: result };
  }

  listImports(companyId: number) {
    return this.prisma.portfolioImportJob.findMany({
      where: { companyId },
      include: { insurer: true, startedBy: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  }

  async startPortfolioImport(companyId: number, insurerId: number | null, userId: number, dto: StartPortfolioImportDto) {
    if (insurerId) await this.ensureInsurer(insurerId);
    const environment = dto.environment || "PRODUCTION";
    const integration = insurerId
      ? await this.prisma.insurerIntegration.findUnique({
          where: { companyId_insurerId_environment: { companyId, insurerId, environment } },
          include: { insurer: true },
        })
      : null;

    if ([ImportSource.API, ImportSource.WEBSERVICE].includes(dto.source) && !integration) {
      throw new BadRequestException("Configure primeiro as credenciais da companhia para este ambiente.");
    }

    const job = await this.prisma.portfolioImportJob.create({
      data: {
        companyId,
        insurerId,
        integrationId: integration?.id,
        source: dto.source,
        status: ImportStatus.RUNNING,
        startedById: userId,
        fileName: dto.fileName || null,
        startedAt: new Date(),
      },
    });

    try {
      let records: PortfolioRecord[];
      if (dto.source === ImportSource.DEMO) {
        records = await this.demo.fetchPortfolio!({});
      } else if (dto.source === ImportSource.API || dto.source === ImportSource.WEBSERVICE) {
        const connector = this.resolveConnector(integration!.insurer.asfCode || integration!.insurer.name);
        if (!connector.fetchPortfolio) {
          throw new BadRequestException("O conector desta companhia ainda não disponibiliza importação direta de carteira.");
        }
        records = await connector.fetchPortfolio(this.credentials(integration!));
      } else {
        throw new BadRequestException("A importação de ficheiros será iniciada a partir do respetivo assistente de carregamento.");
      }
      return await this.importRecords(job.id, companyId, insurerId, records);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido na importação.";
      await this.prisma.portfolioImportJob.update({
        where: { id: job.id },
        data: { status: ImportStatus.FAILED, errorMessage: message, completedAt: new Date() },
      });
      throw error;
    }
  }

  private async importRecords(jobId: number, companyId: number, insurerId: number | null, records: PortfolioRecord[]) {
    let imported = 0;
    let updatedCount = 0;
    let skipped = 0;
    let failed = 0;

    for (const record of records) {
      try {
        const result = await this.prisma.$transaction(async (tx) => {
          let client = record.client.nif
            ? await tx.client.findUnique({ where: { companyId_nif: { companyId, nif: record.client.nif } } })
            : null;
          if (!client && record.client.email) {
            client = await tx.client.findFirst({ where: { companyId, email: record.client.email } });
          }
          if (!client) {
            client = await tx.client.create({
              data: {
                companyId,
                type: record.client.type || "INDIVIDUAL",
                name: record.client.name,
                nif: record.client.nif || null,
                email: record.client.email || null,
                phone: record.client.phone || null,
                address: record.client.address || null,
                postalCode: record.client.postalCode || null,
                city: record.client.city || null,
              },
            });
          } else {
            client = await tx.client.update({
              where: { id: client.id },
              data: {
                name: record.client.name || client.name,
                email: record.client.email || client.email,
                phone: record.client.phone || client.phone,
                address: record.client.address || client.address,
                postalCode: record.client.postalCode || client.postalCode,
                city: record.client.city || client.city,
              },
            });
          }

          const existing = await tx.policy.findUnique({
            where: { companyId_policyNumber: { companyId, policyNumber: record.policyNumber } },
          });
          if (existing) {
            const policy = await tx.policy.update({
              where: { id: existing.id },
              data: {
                clientId: client.id,
                insurerId: insurerId ?? existing.insurerId,
                product: record.product || existing.product,
                branch: record.branch || existing.branch,
                premium: record.premium ?? existing.premium,
                commission: record.commission ?? existing.commission,
                startDate: record.startDate ? new Date(record.startDate) : existing.startDate,
                renewalDate: record.renewalDate ? new Date(record.renewalDate) : existing.renewalDate,
              },
            });
            return { clientId: client.id, policyId: policy.id, action: "UPDATED" as const };
          }

          const policy = await tx.policy.create({
            data: {
              companyId,
              clientId: client.id,
              insurerId,
              policyNumber: record.policyNumber,
              product: record.product,
              branch: record.branch || null,
              premium: record.premium,
              commission: record.commission,
              startDate: record.startDate ? new Date(record.startDate) : null,
              renewalDate: record.renewalDate ? new Date(record.renewalDate) : null,
              status: "ACTIVE",
              notes: `Importado automaticamente através de ${record.externalId || "carteira externa"}.`,
            },
          });
          return { clientId: client.id, policyId: policy.id, action: "CREATED" as const };
        });

        if (result.action === "CREATED") imported += 1;
        else if (result.action === "UPDATED") updatedCount += 1;
        else skipped += 1;
        await this.prisma.portfolioImportItem.create({
          data: {
            companyId,
            jobId,
            entityType: "POLICY",
            externalId: record.externalId || record.policyNumber,
            status: ImportStatus.COMPLETED,
            clientId: result.clientId,
            policyId: result.policyId,
            rawData: (record.raw || record) as Prisma.InputJsonValue,
            normalizedData: { ...record, importAction: result.action } as unknown as Prisma.InputJsonValue,
          },
        });
      } catch (error) {
        failed += 1;
        await this.prisma.portfolioImportItem.create({
          data: {
            companyId,
            jobId,
            entityType: "POLICY",
            externalId: record.externalId || record.policyNumber,
            status: ImportStatus.FAILED,
            rawData: (record.raw || record) as Prisma.InputJsonValue,
            errorMessage: error instanceof Error ? error.message : "Erro ao importar registo.",
          },
        });
      }
    }

    const successful = imported + updatedCount + skipped;
    const status = failed === 0 ? ImportStatus.COMPLETED : successful > 0 ? ImportStatus.PARTIAL : ImportStatus.FAILED;
    const updated = await this.prisma.portfolioImportJob.update({
      where: { id: jobId },
      data: {
        status,
        totalRecords: records.length,
        importedRecords: imported,
        updatedRecords: updatedCount,
        skippedRecords: skipped,
        failedRecords: failed,
        summary: { imported, updated: updatedCount, skipped, failed },
        completedAt: new Date(),
      } as Prisma.PortfolioImportJobUpdateInput,
      include: { insurer: true, items: { orderBy: { id: "asc" } } },
    });

    const integrationId = updated.integrationId;
    if (integrationId) {
      await this.prisma.insurerIntegration.update({ where: { id: integrationId }, data: { lastSyncAt: new Date(), lastError: failed ? `${failed} registos falharam.` : null } });
    }
    return updated;
  }

  private resolveConnector(code: string): InsurerConnector {
    if (code.toUpperCase().includes("DEMO")) return this.demo;
    return this.manual;
  }

  private credentials(integration: { encryptedConfig: string | null; encryptedSecret: string | null; agencyCode: string | null; username: string | null }) {
    return {
      ...(this.encryption.decrypt<Record<string, unknown>>(integration.encryptedConfig) || {}),
      ...(this.encryption.decrypt<Record<string, unknown>>(integration.encryptedSecret) || {}),
      agencyCode: integration.agencyCode,
      username: integration.username,
    };
  }

  private safeIntegration<T extends { encryptedConfig: string | null; encryptedSecret: string | null }>(integration: T) {
    const { encryptedConfig: _config, encryptedSecret: _secret, ...safe } = integration;
    return { ...safe, hasCredentials: Boolean(_config || _secret) };
  }

  private async ensureInsurer(id: number) {
    const insurer = await this.prisma.insurer.findUnique({ where: { id }, select: { id: true } });
    if (!insurer) throw new NotFoundException("Companhia de seguros não encontrada.");
  }

  private cleanObject<T extends object>(input: T) {
    return Object.fromEntries(Object.entries(input).map(([key, value]) => [key, typeof value === "string" ? value.trim() || null : value])) as T;
  }
}
