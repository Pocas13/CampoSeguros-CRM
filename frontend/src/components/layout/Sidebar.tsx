"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bot,
  Building2,
  CalendarDays,
  FileCheck2,
  FileWarning,
  Cable,
  LayoutDashboard,
  Settings,
  Sparkles,
  UserCog,
  Users,
  History,
  Network,
} from "lucide-react";

import BrandMark from "@/components/brand/BrandMark";
import { useAuth } from "@/providers/AuthProvider";
import { PERMISSIONS } from "@/config/permissions";

type NavigationItem = {
  name: string;
  href: string;
  icon: LucideIcon;
};

type NavigationGroup = {
  label: string;
  items: NavigationItem[];
};

export default function Sidebar() {
  const pathname = usePathname();
  const { user, can, isSuperAdmin } = useAuth();

  const groups: NavigationGroup[] = isSuperAdmin
    ? [
        {
          label: "Plataforma",
          items: [
            { name: "Organizações", href: "/platform/organizations", icon: Network },
            { name: "Configuração", href: "/settings", icon: Settings },
          ],
        },
      ]
    : [
        {
          label: "Operação",
          items: [
            { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
            ...(can(PERMISSIONS.QUOTES_READ) ? [{ name: "Cotações", href: "/quotes", icon: Sparkles }] : []),
            ...(can(PERMISSIONS.CLIENTS_READ) ? [{ name: "Clientes", href: "/clients", icon: Users }] : []),
            ...(can(PERMISSIONS.POLICIES_READ) ? [{ name: "Apólices", href: "/policies", icon: FileCheck2 }] : []),
            ...(can(PERMISSIONS.CLAIMS_MANAGE) ? [{ name: "Sinistros", href: "/claims", icon: FileWarning }] : []),
            ...(can(PERMISSIONS.CALENDAR_MANAGE) ? [{ name: "Agenda", href: "/calendar", icon: CalendarDays }] : []),
          ],
        },
        {
          label: "Rede e análise",
          items: [
            { name: "Companhias", href: "/insurers", icon: Building2 },
            { name: "Relatórios", href: "/reports", icon: BarChart3 },
            { name: "Assistente IA", href: "/ai", icon: Bot },
          ],
        },
        {
          label: "Sistema",
          items: [
            ...(can(PERMISSIONS.USERS_MANAGE) ? [{ name: "Utilizadores", href: "/users", icon: UserCog }] : []),
            ...(can(PERMISSIONS.INTEGRATIONS_MANAGE) ? [{ name: "Integrações", href: "/integrations", icon: Cable }] : []),
            ...(can(PERMISSIONS.AUDIT_READ) ? [{ name: "Auditoria", href: "/audit", icon: History }] : []),
            { name: "Configuração", href: "/settings", icon: Settings },
          ],
        },
      ];

  const initials = (isSuperAdmin ? "InsureFlow" : user?.company?.name || "InsureFlow")
    .split(/\s+/)
    .map((item) => item[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="hidden h-screen w-[282px] shrink-0 flex-col overflow-hidden bg-[radial-gradient(circle_at_top_left,_#173b67_0,_#0b1f38_36%,_#071426_100%)] text-white shadow-2xl lg:flex">
      <div className="border-b border-white/10 px-6 py-6">
        <BrandMark />
      </div>

      <div className="mx-4 mt-5 rounded-2xl border border-cyan-300/15 bg-white/[0.06] p-4 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-400">
              Espaço de trabalho
            </p>
            <p className="mt-1 truncate font-bold">
              {isSuperAdmin ? "Administração InsureFlow" : user?.company?.name || "Mediadora"}
            </p>
          </div>

          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-cyan-400/15 text-sm font-black text-cyan-200">
            {user?.company?.logoUrl ? (
              <img
                src={user.company.logoUrl}
                alt={`Logótipo ${user.company.name}`}
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-5">
        {groups.map((group) => (
          <div key={group.label} className="mb-6">
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              {group.label}
            </p>

            <div className="space-y-1">
              {group.items.map(({ name, href, icon: Icon }) => {
                const active =
                  pathname === href || pathname.startsWith(`${href}/`);

                return (
                  <Link
                    key={href}
                    href={href}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                      active
                        ? "bg-gradient-to-r from-cyan-400/25 to-blue-500/20 text-white shadow-inner ring-1 ring-cyan-300/25"
                        : "text-slate-300 hover:bg-white/[0.07] hover:text-white"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
                        active
                          ? "bg-cyan-400 text-slate-950"
                          : "bg-white/[0.06] text-slate-400 group-hover:text-cyan-300"
                      }`}
                    >
                      <Icon size={18} />
                    </span>
                    {name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="rounded-2xl bg-gradient-to-br from-cyan-400/15 to-indigo-500/15 p-4 ring-1 ring-white/10">
          <p className="text-xs font-bold text-cyan-200">Sessão individual</p>
          <p className="mt-1 text-xs leading-5 text-slate-300">
            {user?.name} ·{" "}
            {user?.jobTitle ||
              (user?.role === "EMPLOYEE" ? "Utilizador" : "Administração")}
          </p>
        </div>
      </div>
    </aside>
  );
}
