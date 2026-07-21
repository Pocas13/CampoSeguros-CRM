"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Building2,
  CalendarClock,
  CircleDollarSign,
  FileCheck2,
  FileWarning,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { api } from "@/services/api";
import { apiError } from "@/lib/api-error";

const euro = (value: number | null | undefined) =>
  new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(value || 0);
const date = (value: string | null) => (value ? new Date(value).toLocaleDateString("pt-PT") : "-");

export default function DashboardPage() {
  const router = useRouter();
  const { isSuperAdmin, loading: authLoading } = useAuth();
  useEffect(() => { if (!authLoading && isSuperAdmin) router.replace("/platform/organizations"); }, [authLoading, isSuperAdmin, router]);
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["dashboard-v2"],
    queryFn: async () => (await api.get("/dashboard")).data,
    retry: false,
    enabled: !authLoading && !isSuperAdmin,
  });

  if (authLoading || isSuperAdmin || isPending) return <div className="panel animate-pulse p-8 text-slate-400">A preparar o seu painel…</div>;
  if (isError || !data) {
    return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{apiError(error, "Não foi possível carregar o dashboard.")}</div>;
  }

  const cards = [
    ["Clientes ativos", data.clients ?? 0, Users, "from-cyan-500 to-blue-600"],
    ["Cotações abertas", data.quotes ?? 0, Sparkles, "from-violet-500 to-indigo-600"],
    ["Apólices ativas", data.policies ?? 0, FileCheck2, "from-emerald-500 to-teal-600"],
    ["Sinistros abertos", data.claims ?? 0, FileWarning, "from-amber-500 to-orange-600"],
  ] as const;

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-3xl bg-[radial-gradient(circle_at_90%_20%,_rgba(34,211,238,.25),_transparent_30%),linear-gradient(135deg,#071426,#123b68)] p-7 text-white shadow-2xl shadow-slate-900/10 md:p-9">
        <div className="relative z-10 max-w-3xl">
          <p className="eyebrow !text-cyan-300">Centro de operação</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">Bom trabalho, {data.currentUser?.name?.split(" ")[0] || "utilizador"}.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
            Acompanhe renovações, compare propostas e transforme cotações em apólices sem perder o histórico do cliente.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/quotes/new" className="btn-primary"><Sparkles size={17} /> Começar cotação</Link>
            <Link href="/calendar" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-bold text-white backdrop-blur hover:bg-white/15"><CalendarClock size={17} /> Ver agenda</Link>
          </div>
        </div>
        <div className="absolute -bottom-24 -right-14 h-72 w-72 rounded-full border-[38px] border-cyan-300/10" />
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, Icon, gradient]) => (
          <div key={label} className="panel p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="mt-3 text-3xl font-black tracking-tight text-slate-900">{value}</p>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg`}><Icon size={20} /></div>
            </div>
            <p className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-600"><TrendingUp size={13} /> Informação em tempo real</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_.85fr]">
        <section className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <div><p className="eyebrow">Pipeline</p><h2 className="mt-1 text-xl font-black text-slate-900">Cotações recentes</h2></div>
            <Link href="/quotes" className="flex items-center gap-1 text-sm font-bold text-cyan-700">Ver todas <ArrowRight size={15} /></Link>
          </div>
          <div className="divide-y divide-slate-100">
            {(data.recentQuotes ?? []).length === 0 ? <p className="p-8 text-sm text-slate-500">Ainda não existem cotações.</p> : (data.recentQuotes ?? []).map((quote: any) => {
              const priced = quote.offers?.filter((offer: any) => offer.annualPremium != null) ?? [];
              const best = priced.sort((a: any, b: any) => a.annualPremium - b.annualPremium)[0];
              return (
                <Link key={quote.id} href={`/quotes/${quote.id}`} className="flex items-center justify-between gap-4 p-5 transition hover:bg-slate-50">
                  <div className="min-w-0"><div className="flex items-center gap-2"><span className="rounded-lg bg-cyan-50 px-2 py-1 text-[10px] font-black text-cyan-700">{quote.productType}</span><span className="text-xs font-semibold text-slate-400">{quote.reference}</span></div><p className="mt-2 truncate font-bold text-slate-900">{quote.title}</p><p className="mt-1 text-xs text-slate-500">{quote.client?.name || "Sem cliente"} · {quote.offers?.length || 0} companhias</p></div>
                  <div className="text-right"><p className="text-xs text-slate-400">Melhor valor</p><p className="mt-1 font-black text-slate-900">{best ? euro(best.annualPremium) : "A aguardar"}</p></div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="panel">
          <div className="border-b border-slate-100 p-5"><p className="eyebrow">Próximos 30 dias</p><h2 className="mt-1 text-xl font-black">Agenda e alertas</h2></div>
          <div className="space-y-3 p-5">
            {(data.upcomingEvents ?? []).length === 0 ? <p className="text-sm text-slate-500">Sem tarefas próximas.</p> : (data.upcomingEvents ?? []).map((event: any) => (
              <div key={event.id} className="flex gap-3 rounded-xl border border-slate-100 p-3">
                <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-amber-50 text-amber-700"><span className="text-[9px] font-black uppercase">{new Date(event.startAt).toLocaleDateString("pt-PT", { month: "short" })}</span><span className="text-sm font-black">{new Date(event.startAt).getDate()}</span></div>
                <div className="min-w-0"><p className="truncate text-sm font-bold text-slate-800">{event.title}</p><p className="mt-1 truncate text-xs text-slate-400">{event.client?.name || event.type}</p></div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {data.financialsVisible ? (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="panel flex items-center gap-4 p-5"><div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600"><CircleDollarSign /></div><div><p className="text-xs font-semibold text-slate-400">Prémios em carteira</p><p className="text-xl font-black">{euro(data.totalPremium)}</p></div></div>
          <div className="panel flex items-center gap-4 p-5"><div className="rounded-2xl bg-violet-50 p-3 text-violet-600"><TrendingUp /></div><div><p className="text-xs font-semibold text-slate-400">Comissões estimadas</p><p className="text-xl font-black">{euro(data.totalCommission)}</p></div></div>
          <div className="panel flex items-center gap-4 p-5"><div className="rounded-2xl bg-blue-50 p-3 text-blue-600"><Building2 /></div><div><p className="text-xs font-semibold text-slate-400">Companhias ativas</p><p className="text-xl font-black">{data.insurers ?? 0}</p></div></div>
        </div>
      ) : (
        <div className="panel flex flex-wrap items-center justify-between gap-4 p-5"><div><p className="eyebrow">Visão operacional</p><h2 className="mt-1 text-xl font-black">O seu painel não apresenta valores financeiros</h2><p className="mt-1 text-sm text-slate-500">Prémios globais e comissões estão reservados à administração e gestão.</p></div><div className="rounded-2xl bg-blue-50 px-5 py-3 text-center text-blue-700"><p className="text-xs font-bold">Companhias ativas</p><p className="text-2xl font-black">{data.insurers ?? 0}</p></div></div>
      )}

      <section className="panel overflow-hidden">
        <div className="border-b border-slate-100 p-5"><p className="eyebrow">Carteira</p><h2 className="mt-1 text-xl font-black">Renovações nos próximos 60 dias</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm"><thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-400"><tr><th className="p-4">Cliente</th><th className="p-4">Apólice</th><th className="p-4">Companhia</th><th className="p-4">Produto</th><th className="p-4">Renovação</th></tr></thead><tbody>{(data.renewals ?? []).map((policy: any) => <tr key={policy.id} className="border-t border-slate-100"><td className="p-4 font-bold">{policy.client.name}</td><td className="p-4"><Link href={`/policies/${policy.id}`} className="text-cyan-700 hover:underline">{policy.policyNumber}</Link></td><td className="p-4">{policy.insurer?.commercialName || "-"}</td><td className="p-4">{policy.product}</td><td className="p-4 font-bold text-amber-700">{date(policy.renewalDate)}</td></tr>)}</tbody></table>
        </div>
      </section>
    </div>
  );
}
