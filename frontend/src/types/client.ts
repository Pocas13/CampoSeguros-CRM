export type PolicyStatus =
  | "ACTIVE"
  | "PENDING"
  | "CANCELLED"
  | "EXPIRED";

export type ClaimStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "CLOSED";

export type Policy = {
  id: number;
  policyNumber: string;
  product: string;
  insurer: string;
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
  clientId: number;
  companyId: number;
  insuranceType: string;
  premium: number | null;
  commission: number | null;
  notes: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type Client = {
  id: number;
  name: string;
  nif: string | null;
  birthDate: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  postalCode: string | null;
  city: string | null;
  notes: string | null;
  active: boolean;
  companyId: number;
  createdAt: string;
  updatedAt: string;

  policies?: Policy[];
  claims?: Claim[];
  simulations?: Simulation[];
};