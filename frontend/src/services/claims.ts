import { api } from "./api";

export type ClaimStatus = "OPEN" | "IN_PROGRESS" | "CLOSED";

export type Claim = {
  id: number;
  claimNumber: string;
  description: string | null;
  status: ClaimStatus;
  clientId: number;
  policyId: number | null;
  createdAt: string;
  updatedAt: string;
  client: { id: number; name: string; nif?: string | null; email?: string | null; phone?: string | null };
  policy: {
    id: number;
    policyNumber: string;
    product: string;
    renewalDate?: string | null;
    insurer: { id?: number; name: string; commercialName: string | null } | null;
  } | null;
};

export const listClaims = async () => (await api.get<Claim[]>("/claims")).data;
export const getClaim = async (id: number) => (await api.get<Claim>(`/claims/${id}`)).data;
export const createClaim = async (data: {
  claimNumber: string;
  clientId: number;
  policyId?: number | null;
  description?: string | null;
  status?: ClaimStatus;
}) => (await api.post<Claim>("/claims", data)).data;
export const updateClaim = async (id: number, data: Partial<{
  claimNumber: string;
  clientId: number;
  policyId: number | null;
  description: string | null;
  status: ClaimStatus;
}>) => (await api.patch<Claim>(`/claims/${id}`, data)).data;
export const deleteClaim = async (id: number) => (await api.delete(`/claims/${id}`)).data;
