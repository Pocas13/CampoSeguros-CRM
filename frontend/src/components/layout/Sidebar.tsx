"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  Shield,
  Calendar,
  BarChart3,
  BrainCircuit,
  Scale,
  Settings,
} from "lucide-react";

const menu = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Clientes", href: "/clients", icon: Users },
  { name: "Empresas", href: "/companies", icon: Building2 },
  { name: "Apólices", href: "/policies", icon: FileText },
  { name: "Sinistros", href: "/claims", icon: Shield },
  { name: "Agenda", href: "/calendar", icon: Calendar },
  { name: "Relatórios", href: "/reports", icon: BarChart3 },
  { name: "IA", href: "/ai", icon: BrainCircuit },
  { name: "Comparador", href: "/comparator", icon: Scale },
  { name: "Configuração", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col">

      <div className="border-b border-slate-700 p-6">

        <h1 className="text-3xl font-bold text-blue-400">

          InsureFlow

        </h1>

      </div>

      <nav className="flex-1 p-4">

        {menu.map((item) => {

          const Icon = item.icon;

          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mb-2 flex items-center gap-3 rounded-lg px-4 py-3 transition

              ${
                active
                  ? "bg-blue-600"
                  : "hover:bg-slate-700"
              }`}
            >
              <Icon size={20} />

              {item.name}

            </Link>
          );

        })}

      </nav>

    </aside>
  );
}