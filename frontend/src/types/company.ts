export type CompanyCounts = {
  users: number;
  clients: number;
  simulations: number;
};

export type CompanyUser = {
  id: number;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "EMPLOYEE";
  active: boolean;
  createdAt: string;
};

export type CompanyClient = {
  id: number;
  name: string;
  nif: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  active: boolean;
  updatedAt: string;
};

export type CompanySimulation = {
  id: number;
  insuranceType: string;
  premium: number | null;
  status: string;
  updatedAt: string;
};

export type Company = {
  id: number;
  name: string;
  nif: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  createdAt: string;
  updatedAt: string;
  _count: CompanyCounts;
  users?: CompanyUser[];
  clients?: CompanyClient[];
  simulations?: CompanySimulation[];
};
