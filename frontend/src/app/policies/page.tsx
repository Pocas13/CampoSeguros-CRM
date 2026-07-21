"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileCheck2, Search, Sparkles } from "lucide-react";
import { getPolicies } from "@/services/policies";
import { apiError } from "@/lib/api-error";

const euro=(value:number|null)=>value==null?'-':new Intl.NumberFormat('pt-PT',{style:'currency',currency:'EUR'}).format(value);
const date=(value:string|null)=>value?new Date(value).toLocaleDateString('pt-PT'):'-';
const state:Record<string,string>={ACTIVE:'Ativa',PENDING:'Pendente',CANCELLED:'Anulada',EXPIRED:'Expirada'};

export default function PoliciesPage(){
  const[search,setSearch]=useState('');
  const{data=[],isPending,isError,error}=useQuery({queryKey:['policies'],queryFn:getPolicies,retry:false});
  const rows=useMemo(()=>data.filter((p:any)=>`${p.policyNumber} ${p.client?.name||''} ${p.insurer?.commercialName||''} ${p.product}`.toLowerCase().includes(search.toLowerCase())),[data,search]);
  if(isPending)return <div className="panel p-8 text-slate-400">A carregar carteira…</div>;
  if(isError)return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{apiError(error)}</div>;
  return <div className="space-y-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Carteira</p><h1 className="mt-1 text-3xl font-black">Apólices</h1><p className="mt-2 text-sm text-slate-500">Consulte apólices, tomadores, documentação, sinistros e renovações.</p></div><Link href="/quotes/new" className="btn-primary"><Sparkles size={17}/> Criar através de cotação</Link></div>
    <div className="panel flex items-center px-4"><Search size={17} className="text-slate-400"/><input value={search} onChange={(e)=>setSearch(e.target.value)} className="w-full bg-transparent px-3 py-3 text-sm outline-none" placeholder="Pesquisar apólice, cliente, companhia ou produto…"/></div>
    <div className="panel overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[980px] text-sm"><thead className="bg-slate-50 text-left text-[10px] font-black uppercase tracking-wider text-slate-400"><tr><th className="p-4">Apólice</th><th className="p-4">Tomador</th><th className="p-4">Companhia</th><th className="p-4">Produto</th><th className="p-4">Prémio</th><th className="p-4">Renovação</th><th className="p-4">Docs</th><th className="p-4">Estado</th></tr></thead><tbody>{rows.map((p:any)=><tr key={p.id} className="border-t border-slate-100 transition hover:bg-slate-50"><td className="p-4"><Link href={`/policies/${p.id}`} className="font-black text-cyan-700 hover:underline">{p.policyNumber}</Link>{p.quote&&<p className="mt-1 text-[10px] font-bold text-violet-500">Origem: {p.quote.reference}</p>}</td><td className="p-4 font-bold">{p.client?.name||'-'}</td><td className="p-4">{p.insurer?.commercialName||p.insurerNameLegacy||'-'}</td><td className="p-4">{p.product}</td><td className="p-4 font-black">{euro(p.premium)}</td><td className="p-4 font-bold text-amber-700">{date(p.renewalDate)}</td><td className="p-4">{p._count?.documents||0}</td><td className="p-4"><span className={`rounded-lg px-2 py-1 text-[10px] font-black uppercase ${p.status==='ACTIVE'?'bg-emerald-50 text-emerald-700':'bg-slate-100 text-slate-600'}`}>{state[p.status]||p.status}</span></td></tr>)}</tbody></table></div>{rows.length===0&&<div className="p-12 text-center"><FileCheck2 className="mx-auto text-slate-300" size={36}/><p className="mt-3 font-bold text-slate-700">Sem apólices para apresentar.</p><p className="mt-1 text-sm text-slate-400">Comece por criar uma cotação e escolher uma proposta.</p></div>}</div>
  </div>;
}
