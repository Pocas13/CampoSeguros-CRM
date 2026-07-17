export interface Client {
  id: number;
  name: string;
  nif?: string;
  email?: string;
  phone?: string;
  city?: string;
  companyId: number;
  createdAt: string;
}