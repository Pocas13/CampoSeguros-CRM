export type PolicyStatus = "ACTIVE" | "PENDING" | "CANCELLED" | "EXPIRED";
export type ClaimStatus = "OPEN" | "IN_PROGRESS" | "CLOSED";

export type Policy = {
  id: number;
  policyNumber: string;
  product: string;
  branch?: string | null;
  insurerNameLegacy?: string | null;
  insurer?: { id: number; name: string; commercialName: string | null } | null;
  premium: number | null;
  renewalDate: string | null;
  status: PolicyStatus;
  clientId: number;
  createdAt: string;
  updatedAt: string;
};

export type Claim = {
  id: number;
  claimNumber: string;
  description: string | null;
  status: ClaimStatus;
  clientId: number;
  policyId: number | null;
  createdAt: string;
  updatedAt: string;
};

export type Simulation = {
  id: number;
  insuranceType: string;
  premium: number | null;
  commission: number | null;
  notes: string | null;
  status: string;
  createdAt: string;
};

export type ClientQuote = {
  id: number;
  reference: string;
  title: string;
  productType: string;
  status: string;
  updatedAt: string;
  offers: Array<{ id: number; annualPremium: number | null; selected: boolean; insurer: { commercialName: string | null; name: string } }>;
  policy?: { id: number; policyNumber: string } | null;
};

export type Client = {
  type: "INDIVIDUAL" | "BUSINESS";
  id: number;
  name: string;
  nif: string | null;
  birthDate: string | null;
  incorporationDate: string | null;
  cae: string | null;
  representativeName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  postalCode: string | null;
  city: string | null;
  country: string | null;
  notes: string | null;
  active: boolean;
  companyId: number;
  createdAt: string;
  updatedAt: string;
  policies?: Policy[];
  claims?: Claim[];
  simulations?: Simulation[];
  quotes?: ClientQuote[];
};
