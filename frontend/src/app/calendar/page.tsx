"use client";

import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { pt } from "date-fns/locale";
import { CalendarPlus, ChevronLeft, ChevronRight, Clock, FileCheck2, Sparkles, User } from "lucide-react";
import { createCalendarEvent, getCalendarEvents } from "@/services/calendar";
import { getClients } from "@/services/clients";
import { getPolicies } from "@/services/policies";
import { getQuotes } from "@/services/quotes";
import { getUserDirectory } from "@/services/users";
import { apiError } from "@/lib/api-error";
import type { CalendarEvent } from "@/types/calendar";

const typeStyle: Record<string,string>={RENEWAL:'bg-amber-100 text-amber-800 border-amber-200',MEETING:'bg-blue-100 text-blue-800 border-blue-200',CALL:'bg-violet-100 text-violet-800 border-violet-200',TASK:'bg-slate-100 text-slate-700 border-slate-200',FOLLOW_UP:'bg-emerald-100 text-emerald-800 border-emerald-200'};

export default function CalendarPage(){
  const[month,setMonth]=useState(startOfMonth(new Date())); const[selectedDate,setSelectedDate]=useState(new Date()); const[showForm,setShowForm]=useState(false); const qc=useQueryClient();
  const gridStart=startOfWeek(startOfMonth(month),{weekStartsOn:1}); const gridEnd=endOfWeek(endOfMonth(month),{weekStartsOn:1});
  const{data:events=[],isPending,isError,error}=useQuery({queryKey:['calendar',format(month,'yyyy-MM')],queryFn:()=>getCalendarEvents(gridStart.toISOString(),gridEnd.toISOString()),retry:false});
  const days=[];for(let day=gridStart;day<=gridEnd;day=addDays(day,1))days.push(day);
  const selectedEvents=useMemo(()=>events.filter(event=>isSameDay(new Date(event.startAt),selectedDate)),[events,selectedDate]);
  if(isPending)return <div className="panel p-8 text-slate-400">A carregar agenda…</div>;
  if(isError)return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{apiError(error)}</div>;
  return <div className="space-y-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Planeamento e renovações</p><h1 className="mt-1 text-3xl font-black">Agenda</h1><p className="mt-2 text-sm text-slate-500">Agendamentos, lembretes, reuniões e renovações automáticas da carteira.</p></div><button onClick={()=>setShowForm(true)} className="btn-primary"><CalendarPlus size={17}/> Novo agendamento</button></div>
  <div className="grid gap-6 xl:grid-cols-[1.4fr_.6fr]"><section className="panel overflow-hidden"><div className="flex items-center justify-between border-b border-slate-100 p-5"><button onClick={()=>setMonth(subMonths(month,1))} className="rounded-xl border border-slate-200 p-2 hover:bg-slate-50"><ChevronLeft size={18}/></button><div className="text-center"><p className="text-xl font-black capitalize">{format(month,'MMMM yyyy',{locale:pt})}</p><button onClick={()=>{setMonth(startOfMonth(new Date()));setSelectedDate(new Date())}} className="mt-1 text-xs font-bold text-cyan-700">Hoje</button></div><button onClick={()=>setMonth(addMonths(month,1))} className="rounded-xl border border-slate-200 p-2 hover:bg-slate-50"><ChevronRight size={18}/></button></div><div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">{['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map(d=><div key={d} className="p-3 text-center text-[10px] font-black uppercase tracking-wider text-slate-400">{d}</div>)}</div><div className="grid grid-cols-7">{days.map(day=>{const dayEvents=events.filter(event=>isSameDay(new Date(event.startAt),day));const selected=isSameDay(day,selectedDate);return <button key={day.toISOString()} onClick={()=>setSelectedDate(day)} className={`min-h-28 border-b border-r border-slate-100 p-2 text-left transition hover:bg-slate-50 ${!isSameMonth(day,month)?'bg-slate-50/50 text-slate-300':''} ${selected?'ring-2 ring-inset ring-cyan-500':''}`}><span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black ${isSameDay(day,new Date())?'bg-cyan-600 text-white':'text-slate-600'}`}>{format(day,'d')}</span><div className="mt-1 space-y-1">{dayEvents.slice(0,3).map(event=><div key={String(event.id)} className={`truncate rounded-md border px-1.5 py-1 text-[9px] font-bold ${typeStyle[event.type]||typeStyle.TASK}`}>{event.title}</div>)}{dayEvents.length>3&&<p className="text-[9px] font-bold text-slate-400">+{dayEvents.length-3} eventos</p>}</div></button>})}</div></section>
  <aside className="space-y-4"><section className="panel p-5"><p className="eyebrow">Dia selecionado</p><h2 className="mt-1 text-xl font-black capitalize">{format(selectedDate,"EEEE, d 'de' MMMM",{locale:pt})}</h2><div className="mt-5 space-y-3">{selectedEvents.map(event=><EventCard key={String(event.id)} event={event}/>) }{selectedEvents.length===0&&<div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center"><Clock className="mx-auto text-slate-300"/><p className="mt-3 text-sm font-bold text-slate-600">Sem eventos neste dia.</p><button onClick={()=>setShowForm(true)} className="mt-3 text-xs font-bold text-cyan-700">Criar agendamento</button></div>}</div></section><section className="rounded-3xl bg-gradient-to-br from-slate-900 to-blue-950 p-5 text-white"><Sparkles className="text-cyan-300"/><h3 className="mt-3 text-lg font-black">Renovações automáticas</h3><p className="mt-2 text-sm leading-6 text-slate-300">As datas de renovação das apólices aparecem na agenda mesmo sem criar tarefas manualmente.</p></section></aside></div>
  {showForm&&<EventForm date={selectedDate} onClose={()=>setShowForm(false)} onSaved={async()=>{setShowForm(false);await qc.invalidateQueries({queryKey:['calendar']})}}/>}</div>;
}
function EventCard({event}:{event:CalendarEvent}){return <div className={`rounded-2xl border p-4 ${typeStyle[event.type]||typeStyle.TASK}`}><div className="flex items-start justify-between gap-3"><div><p className="font-black">{event.title}</p><p className="mt-1 text-xs opacity-70">{event.allDay?'Dia inteiro':new Date(event.startAt).toLocaleTimeString('pt-PT',{hour:'2-digit',minute:'2-digit'})} · {event.type}</p></div>{event.computed&&<span className="rounded-lg bg-white/60 px-2 py-1 text-[9px] font-black">AUTOMÁTICO</span>}</div>{event.description&&<p className="mt-3 text-sm opacity-80">{event.description}</p>}<div className="mt-3 flex flex-wrap gap-2 text-[10px] font-bold">{event.client&&<span className="flex items-center gap-1 rounded-lg bg-white/60 px-2 py-1"><User size={12}/>{event.client.name}</span>}{event.policy&&<span className="flex items-center gap-1 rounded-lg bg-white/60 px-2 py-1"><FileCheck2 size={12}/>{event.policy.policyNumber}</span>}{event.assignedTo&&<span className="flex items-center gap-1 rounded-lg bg-white/60 px-2 py-1"><User size={12}/>{event.assignedTo.name}</span>}</div></div>}
function EventForm({
  date,
  onClose,
  onSaved,
}: {
  date: Date;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
  });
  const { data: policies = [] } = useQuery({
    queryKey: ["policies"],
    queryFn: getPolicies,
  });
  const { data: quotes = [] } = useQuery({
    queryKey: ["quotes"],
    queryFn: getQuotes,
  });
  const { data: users = [] } = useQuery({
    queryKey: ["user-directory"],
    queryFn: getUserDirectory,
  });

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "TASK",
    priority: "NORMAL",
    startAt: format(date, "yyyy-MM-dd'T'09:00"),
    endAt: "",
    allDay: false,
    assignedToId: "",
    clientId: "",
    policyId: "",
    quoteId: "",
  });

  const mutation = useMutation({
    mutationFn: () =>
      createCalendarEvent({
        title: form.title,
        description: form.description || null,
        type: form.type,
        priority: form.priority,
        startAt: new Date(form.startAt).toISOString(),
        endAt: form.endAt ? new Date(form.endAt).toISOString() : null,
        allDay: form.allDay,
        assignedToId: form.assignedToId
          ? Number(form.assignedToId)
          : undefined,
        clientId: form.clientId ? Number(form.clientId) : null,
        policyId: form.policyId ? Number(form.policyId) : null,
        quoteId: form.quoteId ? Number(form.quoteId) : null,
        reminders: [1440, 60],
      }),
    onSuccess: onSaved,
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <form
        onSubmit={submit}
        onMouseDown={(event) => event.stopPropagation()}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
      >
        <h2 className="text-xl font-black">Novo agendamento</h2>
        <p className="mt-1 text-sm text-slate-500">
          Associe a tarefa a um colaborador, cliente ou processo.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="md:col-span-2 text-sm font-bold">
            Título
            <input
              required
              className="field mt-2"
              value={form.title}
              onChange={(event) =>
                setForm({ ...form, title: event.target.value })
              }
            />
          </label>

          <label className="text-sm font-bold">
            Tipo
            <select
              className="field mt-2"
              value={form.type}
              onChange={(event) =>
                setForm({ ...form, type: event.target.value })
              }
            >
              <option value="TASK">Tarefa</option>
              <option value="CALL">Chamada</option>
              <option value="MEETING">Reunião</option>
              <option value="FOLLOW_UP">Follow-up</option>
              <option value="RENEWAL">Renovação</option>
            </select>
          </label>

          <label className="text-sm font-bold">
            Prioridade
            <select
              className="field mt-2"
              value={form.priority}
              onChange={(event) =>
                setForm({ ...form, priority: event.target.value })
              }
            >
              <option value="LOW">Baixa</option>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">Alta</option>
              <option value="URGENT">Urgente</option>
            </select>
          </label>

          <label className="text-sm font-bold">
            Início
            <input
              type="datetime-local"
              required
              className="field mt-2"
              value={form.startAt}
              onChange={(event) =>
                setForm({ ...form, startAt: event.target.value })
              }
            />
          </label>

          <label className="text-sm font-bold">
            Fim
            <input
              type="datetime-local"
              className="field mt-2"
              value={form.endAt}
              onChange={(event) =>
                setForm({ ...form, endAt: event.target.value })
              }
            />
          </label>

          <label className="md:col-span-2 text-sm font-bold">
            Responsável
            <select
              className="field mt-2"
              value={form.assignedToId}
              onChange={(event) =>
                setForm({ ...form, assignedToId: event.target.value })
              }
            >
              <option value="">Atribuir a mim</option>
              {users.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                  {item.jobTitle ? ` · ${item.jobTitle}` : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-bold">
            Cliente
            <select
              className="field mt-2"
              value={form.clientId}
              onChange={(event) =>
                setForm({ ...form, clientId: event.target.value })
              }
            >
              <option value="">Sem associação</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-bold">
            Apólice
            <select
              className="field mt-2"
              value={form.policyId}
              onChange={(event) =>
                setForm({ ...form, policyId: event.target.value })
              }
            >
              <option value="">Sem associação</option>
              {policies.map((policy: any) => (
                <option key={policy.id} value={policy.id}>
                  {policy.policyNumber} · {policy.client?.name}
                </option>
              ))}
            </select>
          </label>

          <label className="md:col-span-2 text-sm font-bold">
            Cotação
            <select
              className="field mt-2"
              value={form.quoteId}
              onChange={(event) =>
                setForm({ ...form, quoteId: event.target.value })
              }
            >
              <option value="">Sem associação</option>
              {quotes.map((quote) => (
                <option key={quote.id} value={quote.id}>
                  {quote.reference} · {quote.title}
                </option>
              ))}
            </select>
          </label>

          <label className="md:col-span-2 text-sm font-bold">
            Descrição
            <textarea
              rows={3}
              className="field mt-2 resize-none"
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
            />
          </label>

          <label className="md:col-span-2 flex items-center gap-2 text-sm font-bold">
            <input
              type="checkbox"
              checked={form.allDay}
              onChange={(event) =>
                setForm({ ...form, allDay: event.target.checked })
              }
              className="h-4 w-4 accent-cyan-600"
            />
            Evento de dia inteiro
          </label>
        </div>

        {mutation.isError && (
          <p className="mt-4 text-sm font-bold text-rose-600">
            {apiError(mutation.error)}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button className="btn-primary" disabled={mutation.isPending}>
            {mutation.isPending ? "A guardar…" : "Guardar agendamento"}
          </button>
        </div>
      </form>
    </div>
  );
}
