export type QuoteOffer = {
  id: number;
  insurerId: number;
  quoteNumber: string | null;
  annualPremium: number | null;
  installmentPremium: number | null;
  commission: number | null;
  deductible: number | null;
  status: string;
  validUntil: string | null;
  coverages: Record<string, unknown> | null;
  exclusions: Record<string, unknown> | null;
  notes: string | null;
  recommended: boolean;
  selected: boolean;
  insurer: {
    id: number;
    name: string;
    commercialName: string | null;
    website?: string | null;
  };
};

export type Quote = {
  id: number;
  reference: string;
  title: string;
  productType: string;
  status: string;
  origin: string;
  clientId: number | null;
  companyId: number;
  effectiveDate: string | null;
  expiresAt: string | null;
  riskData: Record<string, unknown> | null;
  preferences: Record<string, unknown> | null;
  notes: string | null;
  client: { id: number; name: string; nif: string | null; email?: string | null; phone?: string | null } | null;
  offers: QuoteOffer[];
  documents?: Array<{ id: number; name: string; type: string; url: string | null; fileName: string | null; notes: string | null; createdAt: string }>;
  activities?: Array<{ id: number; action: string; description: string | null; createdAt: string }>;
  policy?: { id: number; policyNumber: string } | null;
  createdAt: string;
  updatedAt: string;
};
