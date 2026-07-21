"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { History, Search } from "lucide-react";
import Avatar from "@/components/common/Avatar";
import { apiError } from "@/lib/api-error";
import { listAudit } from "@/services/audit";

export default function AuditPage() {
  const [search, setSearch] = useState("");
  const query = useQuery({ queryKey: ["audit"], queryFn: () => listAudit(200), retry: false });
  const records = useMemo(() => {
    const needle = search.toLowerCase().trim();
    return (query.data || []).filter((item) => [item.action, item.path, item.entity, item.user?.name, item.user?.email].some((value) => String(value || "").toLowerCase().includes(needle)));
  }, [query.data, search]);

  return <div className="space-y-6">
    <div><p className="eyebrow">Segurança e rastreabilidade</p><h1 className="mt-1 text-3xl font-black">Auditoria</h1><p className="mt-2 text-sm text-slate-500">Histórico das alterações realizadas pelos utilizadores da mediadora.</p></div>
    {query.error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">{apiError(query.error)}</div>}
    <div className="panel p-4"><label className="flex items-center gap-3"><Search size={18} className="text-slate-400" /><input className="w-full bg-transparent text-sm outline-none" placeholder="Pesquisar utilizador, ação ou caminho…" value={search} onChange={(e) => setSearch(e.target.value)} /></label></div>
    {query.isPending ? <div className="panel animate-pulse p-8 text-slate-400">A carregar auditoria…</div> : (
      <div className="panel overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400"><tr><th className="p-4">Data</th><th className="p-4">Utilizador</th><th className="p-4">Ação</th><th className="p-4">Entidade</th><th className="p-4">Origem</th></tr></thead><tbody>
          {records.map((item) => <tr key={item.id} className="border-t border-slate-100"><td className="whitespace-nowrap p-4">{new Date(item.createdAt).toLocaleString("pt-PT")}</td><td className="p-4"><div className="flex items-center gap-2"><Avatar name={item.user?.name || "Sistema"} src={item.user?.avatarUrl || undefined} size="sm" /><div><p className="font-bold">{item.user?.name || "Sistema"}</p><p className="text-xs text-slate-400">{item.user?.email || "Automação"}</p></div></div></td><td className="p-4"><p className="font-semibold">{item.action}</p><p className="text-xs text-slate-400">{item.path}</p></td><td className="p-4">{item.entity || "-"}{item.entityId ? ` #${item.entityId}` : ""}</td><td className="p-4 text-xs text-slate-500">{item.ipAddress || "-"}</td></tr>)}
          {!records.length && <tr><td colSpan={5} className="p-10 text-center text-slate-400"><History className="mx-auto mb-3" /> Sem registos para mostrar.</td></tr>}
        </tbody></table></div>
      </div>
    )}
  </div>;
}
