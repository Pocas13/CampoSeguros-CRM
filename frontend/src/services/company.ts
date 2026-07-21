import { api } from "./api";

export type CompanySettings = {
  id: number;
  name: string;
  nif: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  postalCode: string | null;
  city: string | null;
  website: string | null;
  logoUrl: string | null;
  asfRegistration: string | null;
};

export const getCurrentCompany = async () => (await api.get<CompanySettings>("/companies/current")).data;
export const updateCurrentCompany = async (data: Partial<CompanySettings>) => (await api.patch<CompanySettings>("/companies/current", data)).data;
