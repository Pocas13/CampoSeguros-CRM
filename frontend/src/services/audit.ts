import { api } from "./api";

export type AuditEntry = {
  id: string;
  action: string;
  method: string | null;
  path: string | null;
  entity: string | null;
  entityId: string | null;
  ipAddress: string | null;
  createdAt: string;
  user: { id: number; name: string; email: string; avatarUrl: string | null } | null;
  metadata: Record<string, unknown> | null;
};

export async function listAudit(take = 150) {
  return (await api.get<AuditEntry[]>(`/audit?take=${take}`)).data;
}
