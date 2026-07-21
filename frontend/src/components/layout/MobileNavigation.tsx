"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, LayoutDashboard, Network, Settings, Sparkles, Users } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { PERMISSIONS } from "@/config/permissions";

export default function MobileNavigation() {
  const pathname = usePathname();
  const { can, isSuperAdmin } = useAuth();
  const items = isSuperAdmin
    ? [
        { name: "Mediadoras", href: "/platform/organizations", icon: Network },
        { name: "Perfil", href: "/settings", icon: Settings },
      ]
    : [
        { name: "Início", href: "/dashboard", icon: LayoutDashboard },
        ...(can(PERMISSIONS.QUOTES_READ) ? [{ name: "Cotações", href: "/quotes", icon: Sparkles }] : []),
        ...(can(PERMISSIONS.CLIENTS_READ) ? [{ name: "Clientes", href: "/clients", icon: Users }] : []),
        ...(can(PERMISSIONS.CALENDAR_MANAGE) ? [{ name: "Agenda", href: "/calendar", icon: CalendarDays }] : []),
        { name: "Mais", href: "/settings", icon: Settings },
      ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_30px_rgba(15,23,42,.08)] backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-lg justify-around gap-1">
        {items.map(({ name, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return <Link key={href} href={href} className={`flex min-w-16 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-bold transition ${active ? "bg-cyan-50 text-cyan-700" : "text-slate-400 hover:bg-slate-50 hover:text-slate-700"}`}><Icon size={19} strokeWidth={active ? 2.5 : 2} />{name}</Link>;
        })}
      </div>
    </nav>
  );
}
