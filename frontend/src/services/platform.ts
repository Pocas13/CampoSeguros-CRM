import { api } from "./api";

export type OrganizationStatus = "TRIAL" | "ACTIVE" | "SUSPENDED" | "CANCELLED";

export type PlatformOrganization = {
  id: number;
  name: string;
  slug: string | null;
  nif: string | null;
  email: string | null;
  phone: string | null;
  asfRegistration: string | null;
  status: OrganizationStatus;
  plan: string;
  maxUsers: number;
  maxClients: number;
  createdAt: string;
  _count: { users: number; clients: number; policies: number; quotes: number };
};

export type CreateOrganizationInput = {
  name: string;
  nif?: string;
  email?: string;
  phone?: string;
  asfRegistration?: string;
  plan?: string;
  status?: OrganizationStatus;
  maxUsers?: number;
  maxClients?: number;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
};

export async function listOrganizations() {
  return (await api.get<PlatformOrganization[]>("/platform/organizations")).data;
}

export async function createOrganization(input: CreateOrganizationInput) {
  return (await api.post("/platform/organizations", input)).data;
}

export async function updateOrganization(id: number, input: Partial<Pick<PlatformOrganization, "status" | "plan" | "maxUsers" | "maxClients">>) {
  return (await api.patch(`/platform/organizations/${id}`, input)).data;
}
