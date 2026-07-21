import { ForbiddenException } from "@nestjs/common";
import type { AuthenticatedUser } from "../interfaces/authenticated-user.interface";

export function requireCompanyId(user: AuthenticatedUser): number {
  if (!user.companyId) {
    throw new ForbiddenException("Este acesso pertence à administração da plataforma e não está associado a uma mediadora.");
  }
  return user.companyId;
}
