import { UserRole } from "@prisma/client";

export const PERMISSIONS = {
  PLATFORM_MANAGE: "platform.manage",
  ORGANIZATION_MANAGE: "organization.manage",
  USERS_MANAGE: "users.manage",
  INTEGRATIONS_MANAGE: "integrations.manage",
  PORTFOLIO_IMPORT: "portfolio.import",
  AUDIT_READ: "audit.read",
  DASHBOARD_FINANCIALS: "dashboard.financials",
  CLIENTS_READ: "clients.read",
  CLIENTS_WRITE: "clients.write",
  CLIENTS_DELETE: "clients.delete",
  QUOTES_READ: "quotes.read",
  QUOTES_WRITE: "quotes.write",
  QUOTES_CONVERT: "quotes.convert",
  POLICIES_READ: "policies.read",
  POLICIES_WRITE: "policies.write",
  POLICIES_DELETE: "policies.delete",
  CLAIMS_MANAGE: "claims.manage",
  CALENDAR_MANAGE: "calendar.manage",
  EXPORT_DATA: "data.export",
  VIEW_ALL_PROCESSES: "processes.view_all",
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const operational = [
  PERMISSIONS.CLIENTS_READ,
  PERMISSIONS.CLIENTS_WRITE,
  PERMISSIONS.QUOTES_READ,
  PERMISSIONS.QUOTES_WRITE,
  PERMISSIONS.POLICIES_READ,
  PERMISSIONS.CLAIMS_MANAGE,
  PERMISSIONS.CALENDAR_MANAGE,
];

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  SUPER_ADMIN: ["*"],
  ADMIN: [
    PERMISSIONS.ORGANIZATION_MANAGE,
    PERMISSIONS.USERS_MANAGE,
    PERMISSIONS.INTEGRATIONS_MANAGE,
    PERMISSIONS.PORTFOLIO_IMPORT,
    PERMISSIONS.AUDIT_READ,
    PERMISSIONS.DASHBOARD_FINANCIALS,
    PERMISSIONS.CLIENTS_DELETE,
    PERMISSIONS.QUOTES_CONVERT,
    PERMISSIONS.POLICIES_WRITE,
    PERMISSIONS.POLICIES_DELETE,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.VIEW_ALL_PROCESSES,
    ...operational,
  ],
  MANAGER: [
    PERMISSIONS.DASHBOARD_FINANCIALS,
    PERMISSIONS.PORTFOLIO_IMPORT,
    PERMISSIONS.CLIENTS_DELETE,
    PERMISSIONS.QUOTES_CONVERT,
    PERMISSIONS.POLICIES_WRITE,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.VIEW_ALL_PROCESSES,
    ...operational,
  ],
  EMPLOYEE: operational,
};

export function effectivePermissions(role: UserRole, custom: string[] = []) {
  return Array.from(new Set([...ROLE_PERMISSIONS[role], ...custom]));
}

export function hasPermission(role: UserRole, custom: string[] | undefined, permission: string) {
  const permissions = effectivePermissions(role, custom || []);
  return permissions.includes("*") || permissions.includes(permission);
}
