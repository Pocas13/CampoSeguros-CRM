import {
  BarChart3,
  CalendarDays,
  FileText,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  Waypoints,
} from "lucide-react";
import { Logo } from "@/components/common/Logo";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard },
  { title: "Clientes", icon: Users },
  { title: "Apólices", icon: ShieldCheck },
  { title: "Propostas", icon: FileText },
  { title: "Sinistros", icon: Waypoints },
  { title: "Agenda", icon: CalendarDays },
  { title: "Documentos", icon: FileText },
  { title: "Comparador", icon: BarChart3 },
  { title: "Inteligência Artificial", icon: Sparkles },
  { title: "Relatórios", icon: BarChart3 },
  { title: "Configurações", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="min-h-screen w-72 bg-slate-900 p-6 text-white">
      <Logo />

      <nav className="mt-12 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.title}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition hover:bg-slate-800"
            >
              <Icon className="h-4 w-4" />
              <span>{item.title}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
