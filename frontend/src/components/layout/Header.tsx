import { Bell } from "lucide-react";
import { Avatar } from "@/components/common/Avatar";
import { SearchBar } from "@/components/common/SearchBar";

export function Header() {
  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-10">
      <div>
        <h2 className="text-3xl font-bold text-slate-800">Dashboard</h2>
        <p className="text-slate-500">Bem-vindo ao InsureFlow</p>
      </div>

      <div className="flex items-center gap-4">
        <SearchBar />

        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200">
          <Bell className="h-4 w-4" />
        </button>

        <Avatar name="Daniel Campos" initials="DC" />
      </div>
    </header>
  );
}
