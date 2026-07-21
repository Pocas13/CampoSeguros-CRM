-- InsureFlow 2.4: isolamento multiempresa, permissões, integrações e importação de carteira.

DO $$ BEGIN
  CREATE TYPE "OrganizationStatus" AS ENUM ('TRIAL', 'ACTIVE', 'SUSPENDED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "IntegrationMode" AS ENUM ('MANUAL', 'API', 'WEBSERVICE', 'FILE_IMPORT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "IntegrationEnvironment" AS ENUM ('SANDBOX', 'PRODUCTION');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "IntegrationStatus" AS ENUM ('NOT_CONFIGURED', 'CONFIGURED', 'TESTING', 'ACTIVE', 'ERROR', 'DISABLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "ImportSource" AS ENUM ('API', 'WEBSERVICE', 'CSV', 'XLSX', 'XML', 'JSON', 'MANUAL', 'DEMO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "ImportStatus" AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'PARTIAL', 'FAILED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "status" "OrganizationStatus" NOT NULL DEFAULT 'TRIAL';
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "plan" TEXT NOT NULL DEFAULT 'STARTER';
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "maxUsers" INTEGER NOT NULL DEFAULT 5;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "maxClients" INTEGER NOT NULL DEFAULT 1000;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "settings" JSONB;
CREATE UNIQUE INDEX IF NOT EXISTS "Company_slug_key" ON "Company"("slug");

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "permissions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
CREATE INDEX IF NOT EXISTS "User_companyId_idx" ON "User"("companyId");

-- Tornar identificadores comerciais únicos dentro de cada mediadora, não globalmente.
DROP INDEX IF EXISTS "Client_nif_key";
DROP INDEX IF EXISTS "Policy_policyNumber_key";
DROP INDEX IF EXISTS "Claim_claimNumber_key";
DROP INDEX IF EXISTS "Quote_reference_key";
CREATE UNIQUE INDEX IF NOT EXISTS "Client_companyId_nif_key" ON "Client"("companyId", "nif");
CREATE UNIQUE INDEX IF NOT EXISTS "Quote_companyId_reference_key" ON "Quote"("companyId", "reference");

-- Isolamento explícito dos registos que anteriormente dependiam apenas da relação indireta.
ALTER TABLE "Policy" ADD COLUMN IF NOT EXISTS "companyId" INTEGER;
UPDATE "Policy" p SET "companyId" = c."companyId" FROM "Client" c WHERE p."clientId" = c."id" AND p."companyId" IS NULL;
ALTER TABLE "Policy" ALTER COLUMN "companyId" SET NOT NULL;
DO $$ BEGIN
  ALTER TABLE "Policy" ADD CONSTRAINT "Policy_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE UNIQUE INDEX IF NOT EXISTS "Policy_companyId_policyNumber_key" ON "Policy"("companyId", "policyNumber");
CREATE INDEX IF NOT EXISTS "Policy_companyId_idx" ON "Policy"("companyId");

ALTER TABLE "Claim" ADD COLUMN IF NOT EXISTS "companyId" INTEGER;
UPDATE "Claim" c SET "companyId" = cl."companyId" FROM "Client" cl WHERE c."clientId" = cl."id" AND c."companyId" IS NULL;
ALTER TABLE "Claim" ALTER COLUMN "companyId" SET NOT NULL;
DO $$ BEGIN
  ALTER TABLE "Claim" ADD CONSTRAINT "Claim_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE UNIQUE INDEX IF NOT EXISTS "Claim_companyId_claimNumber_key" ON "Claim"("companyId", "claimNumber");
CREATE INDEX IF NOT EXISTS "Claim_companyId_idx" ON "Claim"("companyId");

ALTER TABLE "PolicyDocument" ADD COLUMN IF NOT EXISTS "companyId" INTEGER;
UPDATE "PolicyDocument" d SET "companyId" = p."companyId" FROM "Policy" p WHERE d."policyId" = p."id" AND d."companyId" IS NULL;
ALTER TABLE "PolicyDocument" ALTER COLUMN "companyId" SET NOT NULL;
DO $$ BEGIN
  ALTER TABLE "PolicyDocument" ADD CONSTRAINT "PolicyDocument_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS "PolicyDocument_companyId_idx" ON "PolicyDocument"("companyId");

ALTER TABLE "QuoteOffer" ADD COLUMN IF NOT EXISTS "companyId" INTEGER;
UPDATE "QuoteOffer" o SET "companyId" = q."companyId" FROM "Quote" q WHERE o."quoteId" = q."id" AND o."companyId" IS NULL;
ALTER TABLE "QuoteOffer" ALTER COLUMN "companyId" SET NOT NULL;
DO $$ BEGIN
  ALTER TABLE "QuoteOffer" ADD CONSTRAINT "QuoteOffer_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS "QuoteOffer_companyId_idx" ON "QuoteOffer"("companyId");
CREATE UNIQUE INDEX IF NOT EXISTS "QuoteOffer_quoteId_insurerId_key" ON "QuoteOffer"("quoteId", "insurerId");

ALTER TABLE "QuoteDocument" ADD COLUMN IF NOT EXISTS "companyId" INTEGER;
UPDATE "QuoteDocument" d SET "companyId" = q."companyId" FROM "Quote" q WHERE d."quoteId" = q."id" AND d."companyId" IS NULL;
ALTER TABLE "QuoteDocument" ALTER COLUMN "companyId" SET NOT NULL;
DO $$ BEGIN
  ALTER TABLE "QuoteDocument" ADD CONSTRAINT "QuoteDocument_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS "QuoteDocument_companyId_idx" ON "QuoteDocument"("companyId");

ALTER TABLE "QuoteActivity" ADD COLUMN IF NOT EXISTS "companyId" INTEGER;
UPDATE "QuoteActivity" a SET "companyId" = q."companyId" FROM "Quote" q WHERE a."quoteId" = q."id" AND a."companyId" IS NULL;
ALTER TABLE "QuoteActivity" ALTER COLUMN "companyId" SET NOT NULL;
DO $$ BEGIN
  ALTER TABLE "QuoteActivity" ADD CONSTRAINT "QuoteActivity_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS "QuoteActivity_companyId_idx" ON "QuoteActivity"("companyId");

CREATE TABLE IF NOT EXISTS "OrganizationInsurer" (
  "id" SERIAL PRIMARY KEY,
  "companyId" INTEGER NOT NULL,
  "insurerId" INTEGER NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT TRUE,
  "agencyCode" TEXT,
  "accountManagerName" TEXT,
  "accountManagerEmail" TEXT,
  "accountManagerPhone" TEXT,
  "agentSupportPhone" TEXT,
  "agentSupportEmail" TEXT,
  "claimsPhone" TEXT,
  "claimsEmail" TEXT,
  "assistancePhone" TEXT,
  "customQuoteLinks" JSONB,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OrganizationInsurer_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "OrganizationInsurer_insurerId_fkey" FOREIGN KEY ("insurerId") REFERENCES "Insurer"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "OrganizationInsurer_companyId_insurerId_key" ON "OrganizationInsurer"("companyId", "insurerId");
CREATE INDEX IF NOT EXISTS "OrganizationInsurer_companyId_idx" ON "OrganizationInsurer"("companyId");
CREATE INDEX IF NOT EXISTS "OrganizationInsurer_insurerId_idx" ON "OrganizationInsurer"("insurerId");

CREATE TABLE IF NOT EXISTS "InsurerIntegration" (
  "id" SERIAL PRIMARY KEY,
  "companyId" INTEGER NOT NULL,
  "insurerId" INTEGER NOT NULL,
  "mode" "IntegrationMode" NOT NULL DEFAULT 'MANUAL',
  "environment" "IntegrationEnvironment" NOT NULL DEFAULT 'SANDBOX',
  "status" "IntegrationStatus" NOT NULL DEFAULT 'NOT_CONFIGURED',
  "agencyCode" TEXT,
  "username" TEXT,
  "encryptedConfig" TEXT,
  "encryptedSecret" TEXT,
  "capabilities" JSONB,
  "lastTestedAt" TIMESTAMP(3),
  "lastSyncAt" TIMESTAMP(3),
  "lastError" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InsurerIntegration_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "InsurerIntegration_insurerId_fkey" FOREIGN KEY ("insurerId") REFERENCES "Insurer"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "InsurerIntegration_companyId_insurerId_environment_key" ON "InsurerIntegration"("companyId", "insurerId", "environment");
CREATE INDEX IF NOT EXISTS "InsurerIntegration_companyId_idx" ON "InsurerIntegration"("companyId");
CREATE INDEX IF NOT EXISTS "InsurerIntegration_insurerId_idx" ON "InsurerIntegration"("insurerId");

CREATE TABLE IF NOT EXISTS "PortfolioImportJob" (
  "id" SERIAL PRIMARY KEY,
  "companyId" INTEGER NOT NULL,
  "insurerId" INTEGER,
  "integrationId" INTEGER,
  "source" "ImportSource" NOT NULL,
  "status" "ImportStatus" NOT NULL DEFAULT 'QUEUED',
  "startedById" INTEGER,
  "fileName" TEXT,
  "externalReference" TEXT,
  "totalRecords" INTEGER NOT NULL DEFAULT 0,
  "importedRecords" INTEGER NOT NULL DEFAULT 0,
  "updatedRecords" INTEGER NOT NULL DEFAULT 0,
  "skippedRecords" INTEGER NOT NULL DEFAULT 0,
  "failedRecords" INTEGER NOT NULL DEFAULT 0,
  "summary" JSONB,
  "errorMessage" TEXT,
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PortfolioImportJob_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "PortfolioImportJob_insurerId_fkey" FOREIGN KEY ("insurerId") REFERENCES "Insurer"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "PortfolioImportJob_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "InsurerIntegration"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "PortfolioImportJob_startedById_fkey" FOREIGN KEY ("startedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "PortfolioImportJob_companyId_idx" ON "PortfolioImportJob"("companyId");
CREATE INDEX IF NOT EXISTS "PortfolioImportJob_insurerId_idx" ON "PortfolioImportJob"("insurerId");
CREATE INDEX IF NOT EXISTS "PortfolioImportJob_status_idx" ON "PortfolioImportJob"("status");
CREATE INDEX IF NOT EXISTS "PortfolioImportJob_createdAt_idx" ON "PortfolioImportJob"("createdAt");

CREATE TABLE IF NOT EXISTS "PortfolioImportItem" (
  "id" SERIAL PRIMARY KEY,
  "companyId" INTEGER NOT NULL,
  "jobId" INTEGER NOT NULL,
  "entityType" TEXT NOT NULL,
  "externalId" TEXT,
  "status" "ImportStatus" NOT NULL DEFAULT 'QUEUED',
  "clientId" INTEGER,
  "policyId" INTEGER,
  "rawData" JSONB,
  "normalizedData" JSONB,
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PortfolioImportItem_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "PortfolioImportItem_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "PortfolioImportJob"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "PortfolioImportItem_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "PortfolioImportItem_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "PortfolioImportItem_companyId_idx" ON "PortfolioImportItem"("companyId");
CREATE INDEX IF NOT EXISTS "PortfolioImportItem_jobId_idx" ON "PortfolioImportItem"("jobId");
CREATE INDEX IF NOT EXISTS "PortfolioImportItem_entityType_idx" ON "PortfolioImportItem"("entityType");
CREATE INDEX IF NOT EXISTS "PortfolioImportItem_externalId_idx" ON "PortfolioImportItem"("externalId");
CREATE INDEX IF NOT EXISTS "PortfolioImportItem_clientId_idx" ON "PortfolioImportItem"("clientId");
CREATE INDEX IF NOT EXISTS "PortfolioImportItem_policyId_idx" ON "PortfolioImportItem"("policyId");

CREATE TABLE IF NOT EXISTS "UserInvitation" (
  "id" SERIAL PRIMARY KEY,
  "token" TEXT NOT NULL,
  "companyId" INTEGER NOT NULL,
  "email" TEXT NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'EMPLOYEE',
  "permissions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "invitedById" INTEGER,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "acceptedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserInvitation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "UserInvitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "UserInvitation_token_key" ON "UserInvitation"("token");
CREATE INDEX IF NOT EXISTS "UserInvitation_companyId_idx" ON "UserInvitation"("companyId");
CREATE INDEX IF NOT EXISTS "UserInvitation_email_idx" ON "UserInvitation"("email");
CREATE INDEX IF NOT EXISTS "UserInvitation_expiresAt_idx" ON "UserInvitation"("expiresAt");

CREATE TABLE IF NOT EXISTS "AuditLog" (
  "id" BIGSERIAL PRIMARY KEY,
  "companyId" INTEGER,
  "userId" INTEGER,
  "action" TEXT NOT NULL,
  "method" TEXT NOT NULL,
  "path" TEXT NOT NULL,
  "entity" TEXT,
  "entityId" TEXT,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "AuditLog_companyId_idx" ON "AuditLog"("companyId");
CREATE INDEX IF NOT EXISTS "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
CREATE INDEX IF NOT EXISTS "AuditLog_entity_idx" ON "AuditLog"("entity");

-- Ativar a organização existente e preencher slugs simples sem substituir slugs já definidos.
UPDATE "Company"
SET "status" = 'ACTIVE',
    "slug" = COALESCE("slug", LOWER(REGEXP_REPLACE(REGEXP_REPLACE("name", '[^a-zA-Z0-9]+', '-', 'g'), '(^-|-$)', '', 'g')) || '-' || "id")
WHERE "status" = 'TRIAL' OR "slug" IS NULL;
