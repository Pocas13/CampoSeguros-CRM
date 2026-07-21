"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Filter, Search, Sparkles } from "lucide-react";
import { getQuotes } from "@/services/quotes";
import { apiError } from "@/lib/api-error";

const labels: Record<string, string> = { AUTO: "Automóvel", MOTORCYCLE: "Moto", HOME: "Habitação", LIFE: "Vida", HEALTH: "Saúde", WORK_ACCIDENT: "Acidentes de Trabalho", BUSINESS: "Empresas", TRAVEL: "Viagem", PERSONAL_ACCIDENT: "Acidentes Pessoais" };
const status: Record<string, string> = { DRAFT: "Rascunho", QUOTING: "A consultar", COMPARING: "Em comparação", SELECTED: "Selecionada", CONVERTED: "Convertida", CLOSED: "Encerrada" };
const euro = (v: number | null) => v == null ? "A aguardar" : new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(v);

export default function QuotesPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const { data = [], isPending, isError, error } = useQuery({ queryKey: ["quotes"], queryFn: getQuotes, retry: false });
  const rows = useMemo(() => data.filter((quote) => {
    const match = `${quote.reference} ${quote.title} ${quote.client?.name || ""}`.toLowerCase().includes(search.toLowerCase());
    return match && (filter === "ALL" || quote.status === filter);
  }), [data, search, filter]);

  if (isPending) return <div className="panel p-8 text-slate-400">A carregar cotações…</div>;
  if (isError) return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{apiError(error)}</div>;

  return <div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Simulação multirramos</p><h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">Cotações e comparador</h1><p className="mt-2 text-sm text-slate-500">Recolha os dados uma vez, consulte várias companhias e compare propostas lado a lado.</p></div><Link href="/quotes/new" className="btn-primary"><Sparkles size={18}/> Nova cotação</Link></div>
    <div className="panel flex flex-wrap gap-3 p-4"><div className="flex min-w-[260px] flex-1 items-center rounded-xl border border-slate-200 bg-slate-50 px-3"><Search size={17} className="text-slate-400"/><input value={search} onChange={(e)=>setSearch(e.target.value)} className="w-full bg-transparent px-2 py-2.5 text-sm outline-none" placeholder="Pesquisar por cliente, referência ou produto…"/></div><div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3"><Filter size={16} className="text-slate-400"/><select value={filter} onChange={(e)=>setFilter(e.target.value)} className="bg-transparent py-2.5 text-sm outline-none"><option value="ALL">Todos os estados</option>{Object.entries(status).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></div></div>
    <div className="grid gap-4 xl:grid-cols-2">
      {rows.map((quote) => {
        const priced = quote.offers.filter((offer) => offer.annualPremium != null).sort((a,b)=>(a.annualPremium||0)-(b.annualPremium||0));
        const best = priced[0];
        return <Link key={quote.id} href={`/quotes/${quote.id}`} className="panel group p-5 transition hover:-translate-y-0.5 hover:shadow-xl">
          <div className="flex items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><span className="rounded-lg bg-cyan-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-cyan-700">{labels[quote.productType] || quote.productType}</span><span className="text-xs font-bold text-slate-400">{quote.reference}</span></div><h2 className="mt-3 text-lg font-black text-slate-900">{quote.title}</h2><p className="mt-1 text-sm text-slate-500">{quote.client?.name || "Cliente por associar"}</p></div><ArrowRight className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-cyan-600"/></div>
          <div className="mt-5 grid grid-cols-3 gap-3 rounded-xl bg-slate-50 p-3"><div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Estado</p><p className="mt-1 text-sm font-bold text-slate-700">{status[quote.status] || quote.status}</p></div><div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Companhias</p><p className="mt-1 text-sm font-bold text-slate-700">{quote.offers.length}</p></div><div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Melhor prémio</p><p className="mt-1 text-sm font-black text-emerald-700">{best ? euro(best.annualPremium) : "A aguardar"}</p></div></div>
        </Link>;
      })}
    </div>
    {rows.length===0 && <div className="panel p-12 text-center"><Sparkles className="mx-auto text-slate-300" size={36}/><p className="mt-3 font-bold text-slate-700">Sem cotações para apresentar.</p><Link href="/quotes/new" className="mt-4 inline-flex text-sm font-bold text-cyan-700">Criar a primeira cotação</Link></div>}
  </div>;
}
