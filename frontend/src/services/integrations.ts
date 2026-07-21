import { api } from "./api";

export type IntegrationsStatus = {
  insurerConnectors: {
    architectureReady: boolean;
    productionConnectors: number;
    configuredConnectors: number;
    defaultMode: "MANUAL" | "API" | "WEBSERVICE";
    portfolioImports: number;
    directPortfolioImportReady: boolean;
    message: string;
  };
  vehicleLookup: {
    provider: string;
    configured: boolean;
    registrationPrimary: boolean;
    firstRegistrationDateOptional: boolean;
    vinOptional: boolean;
  };
};

export type OrganizationInsurerSettings = {
  id: number;
  enabled: boolean;
  agencyCode: string | null;
  accountManagerName: string | null;
  accountManagerEmail: string | null;
  accountManagerPhone: string | null;
  agentSupportPhone: string | null;
  agentSupportEmail: string | null;
  claimsPhone: string | null;
  claimsEmail: string | null;
  assistancePhone: string | null;
  notes: string | null;
};

export type IntegrationConfiguration = {
  id: number;
  mode: "MANUAL" | "API" | "WEBSERVICE" | "FILE_IMPORT";
  environment: "SANDBOX" | "PRODUCTION";
  status: string;
  agencyCode: string | null;
  username: string | null;
  capabilities: Record<string, unknown> | null;
  lastTestedAt: string | null;
  lastSyncAt: string | null;
  lastError: string | null;
  hasCredentials: boolean;
};

export type IntegrationInsurer = {
  id: number;
  name: string;
  commercialName: string | null;
  asfCode: string | null;
  website: string | null;
  agentPortalUrl: string | null;
  organizationSettings: OrganizationInsurerSettings | null;
  integrations: IntegrationConfiguration[];
};

export type PortfolioImportJob = {
  id: number;
  source: string;
  status: string;
  totalRecords: number;
  importedRecords: number;
  updatedRecords: number;
  skippedRecords: number;
  failedRecords: number;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
  insurer: { id: number; commercialName: string | null; name: string } | null;
  startedBy: { id: number; name: string; avatarUrl: string | null } | null;
};

export const getIntegrationsStatus = async () => (await api.get<IntegrationsStatus>("/integrations/status")).data;
export const getIntegrationInsurers = async () => (await api.get<IntegrationInsurer[]>("/integrations")).data;
export const getPortfolioImports = async () => (await api.get<PortfolioImportJob[]>("/integrations/portfolio-imports")).data;
export const updateOrganizationInsurer = async (insurerId: number, data: Partial<OrganizationInsurerSettings>) =>
  (await api.patch(`/integrations/insurers/${insurerId}/settings`, data)).data;
export const saveIntegration = async (insurerId: number, data: {
  mode: IntegrationConfiguration["mode"];
  environment: IntegrationConfiguration["environment"];
  agencyCode?: string | null;
  username?: string | null;
  secret?: string | null;
  config?: Record<string, unknown>;
  capabilities?: Record<string, unknown>;
}) => (await api.post(`/integrations/insurers/${insurerId}/configuration`, data)).data;
export const testIntegration = async (insurerId: number, environment: IntegrationConfiguration["environment"]) =>
  (await api.post(`/integrations/insurers/${insurerId}/test?environment=${environment}`)).data;
export const runDemoPortfolioImport = async (insurerId?: number) =>
  (await api.post<PortfolioImportJob>("/integrations/portfolio-imports/demo", { insurerId })).data;
export const runDirectPortfolioImport = async (insurerId: number, source: "API" | "WEBSERVICE", environment: "SANDBOX" | "PRODUCTION") =>
  (await api.post<PortfolioImportJob>(`/integrations/insurers/${insurerId}/portfolio-imports`, { source, environment })).data;
