export type InsurerContact = {
  id: number;
  type: "ACCOUNT_MANAGER" | "COMMERCIAL" | "SUPPORT" | "CLAIMS" | "ASSISTANCE" | "OTHER";
  name: string | null;
  department: string | null;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  schedule: string | null;
  notes: string | null;
  active: boolean;
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

export type Insurer = {
  id: number;
  name: string;
  commercialName: string | null;
  nif: string | null;
  asfCode: string | null;
  website: string | null;
  agentPortalUrl: string | null;
  claimsPortalUrl: string | null;
  quoteLinks: Record<string, string> | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  postalCode: string | null;
  city: string | null;
  active: boolean;
  notes: string | null;
  contacts: InsurerContact[];
  organizationSettings?: OrganizationInsurerSettings | null;
  _count?: { policies: number };
  policies?: any[];
};
