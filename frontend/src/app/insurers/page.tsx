"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Building2, Headphones, Search, ShieldCheck, UserRound } from "lucide-react";
import { getInsurers } from "@/services/insurers";
import { apiError } from "@/lib/api-error";
import { useAuth } from "@/providers/AuthProvider";

const contactIcon: Record<string, any> = { COMMERCIAL: UserRound, ACCOUNT_MANAGER: UserRound, SUPPORT: Headphones, CLAIMS: ShieldCheck };

export default function InsurersPage(){
  const {isAdmin}=useAuth(); const [search,setSearch]=useState("");
  const {data=[],isPending,error}=useQuery({queryKey:["insurers"],queryFn:getInsurers});
  const rows=useMemo(()=>data.filter(i=>`${i.commercialName||""} ${i.name} ${i.email||""}`.toLowerCase().includes(search.toLowerCase())),[data,search]);
  if(isPending)return <div className="panel p-8 text-slate-400">A carregar companhias…</div>;
  if(error)return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-700">{apiError(error,"Erro ao carregar companhias.")}</div>;
  return <div className="space-y-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Diretório comercial e operacional</p><h1 className="mt-1 text-3xl font-black">Companhias de seguros</h1><p className="mt-2 text-sm text-slate-500">Contactos de comerciais, linhas de agentes, sinistros, portais e simuladores.</p></div>{isAdmin&&<Link href="/insurers/new" className="btn-primary">+ Nova companhia</Link>}</div>
    <div className="panel flex items-center px-4 py-3"><Search size={18} className="text-slate-400"/><input className="ml-2 w-full bg-transparent text-sm outline-none" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Pesquisar companhia…"/></div>
    <div className="grid gap-4 xl:grid-cols-2">{rows.map(i=>{const mainContacts=i.contacts?.filter(c=>["COMMERCIAL","ACCOUNT_MANAGER","SUPPORT","CLAIMS"].includes(c.type)).slice(0,3)||[];return <Link key={i.id} href={`/insurers/${i.id}`} className="panel group p-5 transition hover:-translate-y-0.5 hover:shadow-xl"><div className="flex items-start justify-between gap-4"><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-700 font-black text-white">{(i.commercialName||i.name).slice(0,2).toUpperCase()}</div><div><h2 className="text-lg font-black">{i.commercialName||i.name}</h2><p className="text-xs text-slate-400">{i.name}</p></div></div><span className={`rounded-full px-3 py-1 text-xs font-black ${i.active?"bg-emerald-50 text-emerald-700":"bg-slate-100 text-slate-500"}`}>{i.active?"ATIVA":"INATIVA"}</span></div><div className="mt-4 grid gap-2 sm:grid-cols-3">{mainContacts.length?mainContacts.map(c=>{const Icon=contactIcon[c.type]||Building2;return <div key={c.id} className="rounded-xl bg-slate-50 p-3"><Icon size={16} className="text-cyan-700"/><p className="mt-2 truncate text-xs font-black">{c.department||c.type}</p><p className="mt-1 truncate text-[11px] text-slate-400">{c.name||c.phone||c.email||"Por preencher"}</p></div>}):<div className="sm:col-span-3 rounded-xl border border-dashed border-slate-200 p-4 text-xs text-slate-400">Contactos comerciais, agentes e sinistros por preencher.</div>}</div><div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-xs"><span className="font-semibold text-slate-500">{i._count?.policies??0} apólices associadas</span><span className="font-black text-cyan-700">Abrir diretório →</span></div></Link>})}</div>
  </div>;
}
