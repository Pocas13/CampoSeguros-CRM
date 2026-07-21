import { api } from "./api";

export type PolicyListItem = {
  id: number;
  companyId: number;
  clientId: number;
  insurerId: number | null;
  policyNumber: string;
  proposalNumber: string | null;
  product: string;
  branch: string | null;
  premium: number | null;
  commission: number | null;
  startDate: string | null;
  renewalDate: string | null;
  paymentFrequency: string;
  status: string;
  notes: string | null;
  client: { id: number; name: string };
  insurer: { id: number; name: string; commercialName: string | null } | null;
  _count?: { documents: number; claims: number };
};

export const getPolicies = async () => (await api.get<PolicyListItem[]>("/policies")).data;
export const getPolicy = async (id: number) => (await api.get(`/policies/${id}`)).data;
export const updatePolicy = async (id: number, data: Record<string, unknown>) => (await api.patch(`/policies/${id}`, data)).data;
export const deletePolicy = async (id: number) => (await api.delete(`/policies/${id}`)).data;
export const addPolicyDocument = async (id: number, data: Record<string, unknown>) => (await api.post(`/policies/${id}/documents`, data)).data;
