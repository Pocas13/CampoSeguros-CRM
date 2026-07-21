export type InsurerQuoteRequest = {
  quoteId: number;
  productType: string;
  client: Record<string, unknown>;
  risk: Record<string, unknown>;
  preferences: Record<string, unknown>;
  credentials?: Record<string, unknown>;
};

export type InsurerQuoteResponse = {
  externalReference?: string;
  status: "REQUESTED" | "RECEIVED" | "REJECTED" | "ERROR";
  annualPremium?: number;
  installmentPremium?: number;
  deductible?: number;
  coverages?: Record<string, unknown>;
  rawResponse?: unknown;
};

export type PortfolioRecord = {
  externalId?: string;
  policyNumber: string;
  product: string;
  branch?: string;
  premium?: number;
  commission?: number;
  startDate?: string;
  renewalDate?: string;
  client: {
    name: string;
    nif?: string;
    email?: string;
    phone?: string;
    address?: string;
    postalCode?: string;
    city?: string;
    type?: "INDIVIDUAL" | "BUSINESS";
  };
  raw?: unknown;
};

export interface InsurerConnector {
  readonly code: string;
  readonly mode: "API" | "WEBSERVICE" | "MANUAL";
  requestQuote(input: InsurerQuoteRequest): Promise<InsurerQuoteResponse>;
  testConnection?(credentials: Record<string, unknown>): Promise<{ ok: boolean; message: string }>;
  fetchPortfolio?(credentials: Record<string, unknown>): Promise<PortfolioRecord[]>;
}
