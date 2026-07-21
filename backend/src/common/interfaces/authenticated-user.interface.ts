import { UserRole } from "@prisma/client";

export interface AuthenticatedUser {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  permissions: string[];
  companyId: number | null;
  active: boolean;
  avatarUrl: string | null;
  phone: string | null;
  jobTitle: string | null;
}
