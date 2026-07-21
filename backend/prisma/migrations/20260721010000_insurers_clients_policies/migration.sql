DO $$ BEGIN
  CREATE TYPE "ClientType" AS ENUM ('INDIVIDUAL', 'BUSINESS');
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE TYPE "ContactType" AS ENUM ('ACCOUNT_MANAGER','COMMERCIAL','SUPPORT','CLAIMS','ASSISTANCE','OTHER');
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE TYPE "PaymentFrequency" AS ENUM ('MONTHLY','QUARTERLY','SEMIANNUAL','ANNUAL','SINGLE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "type" "ClientType" NOT NULL DEFAULT 'INDIVIDUAL';
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "incorporationDate" TIMESTAMP(3);
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "cae" TEXT;
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "representativeName" TEXT;
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "country" TEXT DEFAULT 'Portugal';

CREATE TABLE IF NOT EXISTS "Insurer" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "commercialName" TEXT,
  "nif" TEXT,
  "asfCode" TEXT,
  "website" TEXT,
  "email" TEXT,
  "phone" TEXT,
  "address" TEXT,
  "postalCode" TEXT,
  "city" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Insurer_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Insurer_nif_key" ON "Insurer"("nif");
CREATE INDEX IF NOT EXISTS "Insurer_name_idx" ON "Insurer"("name");

CREATE TABLE IF NOT EXISTS "InsurerContact" (
  "id" SERIAL NOT NULL,
  "insurerId" INTEGER NOT NULL,
  "type" "ContactType" NOT NULL DEFAULT 'OTHER',
  "name" TEXT,
  "department" TEXT,
  "email" TEXT,
  "phone" TEXT,
  "mobile" TEXT,
  "schedule" TEXT,
  "notes" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "InsurerContact_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "InsurerContact_insurerId_idx" ON "InsurerContact"("insurerId");
DO $$ BEGIN
 ALTER TABLE "InsurerContact" ADD CONSTRAINT "InsurerContact_insurerId_fkey" FOREIGN KEY ("insurerId") REFERENCES "Insurer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

ALTER TABLE "Policy" ADD COLUMN IF NOT EXISTS "proposalNumber" TEXT;
ALTER TABLE "Policy" ADD COLUMN IF NOT EXISTS "branch" TEXT;
ALTER TABLE "Policy" ADD COLUMN IF NOT EXISTS "commission" DOUBLE PRECISION;
ALTER TABLE "Policy" ADD COLUMN IF NOT EXISTS "startDate" TIMESTAMP(3);
ALTER TABLE "Policy" ADD COLUMN IF NOT EXISTS "paymentFrequency" "PaymentFrequency" NOT NULL DEFAULT 'ANNUAL';
ALTER TABLE "Policy" ADD COLUMN IF NOT EXISTS "notes" TEXT;
ALTER TABLE "Policy" ADD COLUMN IF NOT EXISTS "insurerId" INTEGER;
ALTER TABLE "Policy" ALTER COLUMN "insurer" DROP NOT NULL;
ALTER TABLE "Policy" RENAME COLUMN "insurer" TO "insurer_legacy";
ALTER TABLE "Policy" RENAME COLUMN "insurer_legacy" TO "insurer";
DO $$ BEGIN
 ALTER TABLE "Policy" ADD CONSTRAINT "Policy_insurerId_fkey" FOREIGN KEY ("insurerId") REFERENCES "Insurer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
CREATE INDEX IF NOT EXISTS "Policy_clientId_idx" ON "Policy"("clientId");
CREATE INDEX IF NOT EXISTS "Policy_insurerId_idx" ON "Policy"("insurerId");
CREATE INDEX IF NOT EXISTS "Policy_renewalDate_idx" ON "Policy"("renewalDate");

INSERT INTO "Insurer" ("name","commercialName","active","notes","updatedAt")
SELECT v.name,v.commercial,true,'Registo inicial. Atualize os contactos no InsureFlow.',CURRENT_TIMESTAMP
FROM (VALUES
 ('Fidelidade - Companhia de Seguros, S.A.','Fidelidade'),
 ('Generali Seguros, S.A.','Generali Tranquilidade'),
 ('Allianz Portugal, S.A.','Allianz'),
 ('Zurich Insurance Europe AG - Sucursal em Portugal','Zurich'),
 ('Ageas Portugal - Companhia de Seguros, S.A.','Ageas Seguros'),
 ('Liberty Seguros, Compañía de Seguros y Reaseguros, S.A. - Sucursal em Portugal','Liberty Seguros'),
 ('Victoria - Seguros, S.A.','Victoria Seguros'),
 ('Lusitania, Companhia de Seguros, S.A.','Lusitania'),
 ('Caravela - Companhia de Seguros, S.A.','Caravela'),
 ('UNA Seguros, S.A.','UNA Seguros'),
 ('Real Vida Seguros, S.A.','Real Vida'),
 ('MetLife Europe d.a.c. - Sucursal em Portugal','MetLife')
) AS v(name,commercial)
WHERE NOT EXISTS (SELECT 1 FROM "Insurer" i WHERE i."commercialName"=v.commercial);
