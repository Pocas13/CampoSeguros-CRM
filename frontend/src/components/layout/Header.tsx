"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CalendarPlus, ChevronRight, LogOut, Settings, Sparkles, UserRound } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import GlobalSearch from "@/components/common/GlobalSearch";

const labels: Record<string,string> = {dashboard:"Dashboard",quotes:"Cotações",clients:"Clientes",policies:"Apólices",claims:"Sinistros",calendar:"Agenda",insurers:"Companhias",reports:"Relatórios",settings:"Configuração",users:"Utilizadores",new:"Novo",edit:"Editar"};
const roleLabel: Record<string,string> = {SUPER_ADMIN:"Super administrador",ADMIN:"Administrador",MANAGER:"Gestor",EMPLOYEE:"Utilizador"};

export default function Header(){
  const pathname=usePathname(); const {user,logout}=useAuth(); const [open,setOpen]=useState(false);
  const parts=pathname.split("/").filter(Boolean); const date=new Intl.DateTimeFormat("pt-PT",{weekday:"long",day:"2-digit",month:"long"}).format(new Date());
  const initials=(user?.name||"U").split(/\s+/).map((item)=>item[0]).join("").slice(0,2).toUpperCase();
  return <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-xl md:px-7"><div className="flex items-center justify-between gap-4">
    <div className="min-w-0"><div className="flex items-center gap-1 overflow-hidden text-xs font-medium text-slate-400"><span>InsureFlow</span>{parts.map((part)=><span key={part} className="flex items-center gap-1"><ChevronRight size={12}/><span className="truncate text-slate-600">{labels[part]||(/^\d+$/.test(part)?"Detalhe":part)}</span></span>)}</div><p className="mt-0.5 hidden text-xs capitalize text-slate-400 sm:block">{date}</p></div>
    <GlobalSearch/>
    <div className="flex items-center gap-2"><Link href="/calendar" className="hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 md:flex"><CalendarPlus size={18}/></Link><button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"><Bell size={18}/><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white"/></button><Link href="/quotes/new" className="hidden items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 sm:flex"><Sparkles size={17}/>Nova cotação</Link>
      <div className="relative"><button onClick={()=>setOpen(!open)} className="ml-1 flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pr-3 hover:bg-slate-50"><div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-slate-900 text-xs font-black text-white">{user?.avatarUrl?<img src={user.avatarUrl} alt="" className="h-full w-full object-cover"/>:initials}</div><div className="hidden max-w-[150px] text-left leading-tight md:block"><p className="truncate text-xs font-bold text-slate-800">{user?.name}</p><p className="truncate text-[10px] text-slate-400">{roleLabel[user?.role||""]}</p></div></button>{open&&<div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl"><div className="border-b border-slate-100 px-3 py-3"><p className="truncate text-sm font-black">{user?.name}</p><p className="truncate text-xs text-slate-400">{user?.email}</p></div><Link onClick={()=>setOpen(false)} href="/settings" className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><UserRound size={16}/>O meu perfil</Link><Link onClick={()=>setOpen(false)} href="/settings" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Settings size={16}/>Configuração</Link><button onClick={logout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50"><LogOut size={16}/>Terminar sessão</button></div>}</div>
    </div>
  </div></header>;
}
