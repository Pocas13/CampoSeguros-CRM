-- InsureFlow: cotações, comparador, agenda e documentos.
-- Migração incremental: não elimina dados existentes.

CREATE TABLE IF NOT EXISTS "Quote" (
  "id" SERIAL NOT NULL,
  "reference" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "productType" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "origin" TEXT NOT NULL DEFAULT 'MANUAL',
  "clientId" INTEGER,
  "companyId" INTEGER NOT NULL,
  "effectiveDate" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3),
  "riskData" JSONB,
  "preferences" JSONB,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Quote_reference_key" ON "Quote"("reference");
CREATE INDEX IF NOT EXISTS "Quote_clientId_idx" ON "Quote"("clientId");
CREATE INDEX IF NOT EXISTS "Quote_companyId_idx" ON "Quote"("companyId");
CREATE INDEX IF NOT EXISTS "Quote_productType_idx" ON "Quote"("productType");
CREATE INDEX IF NOT EXISTS "Quote_status_idx" ON "Quote"("status");
CREATE INDEX IF NOT EXISTS "Quote_createdAt_idx" ON "Quote"("createdAt");

CREATE TABLE IF NOT EXISTS "QuoteOffer" (
  "id" SERIAL NOT NULL,
  "quoteId" INTEGER NOT NULL,
  "insurerId" INTEGER NOT NULL,
  "quoteNumber" TEXT,
  "annualPremium" DOUBLE PRECISION,
  "installmentPremium" DOUBLE PRECISION,
  "commission" DOUBLE PRECISION,
  "deductible" DOUBLE PRECISION,
  "status" TEXT NOT NULL DEFAULT 'REQUESTED',
  "validUntil" TIMESTAMP(3),
  "coverages" JSONB,
  "exclusions" JSONB,
  "notes" TEXT,
  "recommended" BOOLEAN NOT NULL DEFAULT false,
  "selected" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "QuoteOffer_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "QuoteOffer_quoteId_idx" ON "QuoteOffer"("quoteId");
CREATE INDEX IF NOT EXISTS "QuoteOffer_insurerId_idx" ON "QuoteOffer"("insurerId");
CREATE INDEX IF NOT EXISTS "QuoteOffer_status_idx" ON "QuoteOffer"("status");

CREATE TABLE IF NOT EXISTS "QuoteDocument" (
  "id" SERIAL NOT NULL,
  "quoteId" INTEGER NOT NULL,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'OTHER',
  "fileName" TEXT,
  "url" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "QuoteDocument_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "QuoteDocument_quoteId_idx" ON "QuoteDocument"("quoteId");

CREATE TABLE IF NOT EXISTS "QuoteActivity" (
  "id" SERIAL NOT NULL,
  "quoteId" INTEGER NOT NULL,
  "action" TEXT NOT NULL,
  "description" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "QuoteActivity_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "QuoteActivity_quoteId_idx" ON "QuoteActivity"("quoteId");
CREATE INDEX IF NOT EXISTS "QuoteActivity_createdAt_idx" ON "QuoteActivity"("createdAt");

CREATE TABLE IF NOT EXISTS "PolicyDocument" (
  "id" SERIAL NOT NULL,
  "policyId" INTEGER NOT NULL,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'OTHER',
  "fileName" TEXT,
  "url" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PolicyDocument_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "PolicyDocument_policyId_idx" ON "PolicyDocument"("policyId");

CREATE TABLE IF NOT EXISTS "CalendarEvent" (
  "id" SERIAL NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "type" TEXT NOT NULL DEFAULT 'TASK',
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "priority" TEXT NOT NULL DEFAULT 'NORMAL',
  "startAt" TIMESTAMP(3) NOT NULL,
  "endAt" TIMESTAMP(3),
  "allDay" BOOLEAN NOT NULL DEFAULT false,
  "color" TEXT,
  "reminders" JSONB,
  "companyId" INTEGER NOT NULL,
  "clientId" INTEGER,
  "policyId" INTEGER,
  "quoteId" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CalendarEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "CalendarEvent_companyId_idx" ON "CalendarEvent"("companyId");
CREATE INDEX IF NOT EXISTS "CalendarEvent_startAt_idx" ON "CalendarEvent"("startAt");
CREATE INDEX IF NOT EXISTS "CalendarEvent_clientId_idx" ON "CalendarEvent"("clientId");
CREATE INDEX IF NOT EXISTS "CalendarEvent_policyId_idx" ON "CalendarEvent"("policyId");
CREATE INDEX IF NOT EXISTS "CalendarEvent_quoteId_idx" ON "CalendarEvent"("quoteId");

ALTER TABLE "Policy" ADD COLUMN IF NOT EXISTS "quoteId" INTEGER;
CREATE UNIQUE INDEX IF NOT EXISTS "Policy_quoteId_key" ON "Policy"("quoteId");

DO $$ BEGIN
  ALTER TABLE "Quote" ADD CONSTRAINT "Quote_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Quote" ADD CONSTRAINT "Quote_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "QuoteOffer" ADD CONSTRAINT "QuoteOffer_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "QuoteOffer" ADD CONSTRAINT "QuoteOffer_insurerId_fkey" FOREIGN KEY ("insurerId") REFERENCES "Insurer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "QuoteDocument" ADD CONSTRAINT "QuoteDocument_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "QuoteActivity" ADD CONSTRAINT "QuoteActivity_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "PolicyDocument" ADD CONSTRAINT "PolicyDocument_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Policy" ADD CONSTRAINT "Policy_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
