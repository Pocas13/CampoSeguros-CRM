import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, User, Settings } from "lucide-react";
import { Avatar } from "@/components/common/Avatar";

type UserMenuProps = {
  name?: string;
  initials?: string;
};

export function UserMenu({ name = "Usuário", initials = "U" }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-slate-100"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar name={name} initials={initials} />
        <ChevronDown className="h-4 w-4 text-slate-600" />
      </button>

      {open ? (
        <div className="absolute right-0 z-10 mt-2 w-44 rounded-md border bg-white shadow-lg">
          <a
            href="#"
            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <User className="h-4 w-4" /> Perfil
          </a>

          <a
            href="#"
            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Settings className="h-4 w-4" /> Configurações
          </a>

          <div className="my-1 h-px bg-slate-100" />

          <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      ) : null}
    </div>
  );
}
