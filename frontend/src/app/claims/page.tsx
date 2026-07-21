"use client";

import { type FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  CircleDot,
  Clock3,
  FileWarning,
  Plus,
  Search,
  ShieldAlert,
} from "lucide-react";
import { apiError } from "@/lib/api-error";
import { createClaim, listClaims, type ClaimStatus } from "@/services/claims";
import { getClients } from "@/services/clients";
import { getPolicies } from "@/services/policies";

const statusLabels: Record<ClaimStatus, string> = {
  OPEN: "Aberto",
  IN_PROGRESS: "Em curso",
  CLOSED: "Encerrado",
};

const statusClasses: Record<ClaimStatus, string> = {
  OPEN: "bg-rose-50 text-rose-700",
  IN_PROGRESS: "bg-amber-50 text-amber-700",
  CLOSED: "bg-emerald-50 text-emerald-700",
};

function nextClaimNumber() {
  const now = new Date();
  return `SIN-${now.getFullYear()}-${String(now.getTime()).slice(-6)}`;
}

export default function ClaimsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | ClaimStatus>("ALL");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ claimNumber: "", clientId: 0, policyId: 0, description: "" });

  const claimsQuery = useQuery({ queryKey: ["claims"], queryFn: listClaims });
  const clientsQuery = useQuery({ queryKey: ["clients"], queryFn: getClients });
  const policiesQuery = useQuery({ queryKey: ["policies"], queryFn: getPolicies });

  const save = useMutation({
    mutationFn: () => createClaim({
      claimNumber: form.claimNumber,
      clientId: form.clientId,
      policyId: form.policyId || null,
      description: form.description || null,
    }),
    onSuccess: async () => {
      setOpen(false);
      setForm({ claimNumber: "", clientId: 0, policyId: 0, description: "" });
      await queryClient.invalidateQueries({ queryKey: ["claims"] });
    },
  });

  const claims = claimsQuery.data ?? [];
  const totals = useMemo(() => ({
    total: claims.length,
    open: claims.filter((claim) => claim.status === "OPEN").length,
    inProgress: claims.filter((claim) => claim.status === "IN_PROGRESS").length,
    closed: claims.filter((claim) => claim.status === "CLOSED").length,
  }), [claims]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return claims.filter((claim) => {
      const statusMatches = statusFilter === "ALL" || claim.status === statusFilter;
      const searchMatches = !term || [
        claim.claimNumber,
        claim.client.name,
        claim.policy?.policyNumber,
        claim.policy?.product,
        claim.policy?.insurer?.commercialName,
        claim.description,
      ].some((value) => String(value || "").toLowerCase().includes(term));
      return statusMatches && searchMatches;
    });
  }, [claims, search, statusFilter]);

  const availablePolicies = (policiesQuery.data ?? []).filter((policy) => !form.clientId || policy.clientId === form.clientId);
  const error = claimsQuery.error || save.error;

  function openForm() {
    setForm((current) => ({ ...current, claimNumber: current.claimNumber || nextClaimNumber() }));
    setOpen(true);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    save.mutate();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Acompanhamento</p>
          <h1 className="mt-1 text-3xl font-black">Sinistros</h1>
          <p className="mt-2 text-sm text-slate-500">Centralize participações, contactos, documentos e evolução de cada processo.</p>
        </div>
        <button className="btn-primary" onClick={openForm}><Plus size={17} />Novo sinistro</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={ShieldAlert} label="Total" value={totals.total} className="bg-slate-100 text-slate-700" />
        <Kpi icon={CircleDot} label="Abertos" value={totals.open} className="bg-rose-50 text-rose-700" />
        <Kpi icon={Clock3} label="Em curso" value={totals.inProgress} className="bg-amber-50 text-amber-700" />
        <Kpi icon={CheckCircle2} label="Encerrados" value={totals.closed} className="bg-emerald-50 text-emerald-700" />
      </div>

      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">{apiError(error)}</div>}

      {open && (
        <form onSubmit={submit} className="panel grid gap-4 p-6 md:grid-cols-2">
          <div className="md:col-span-2 flex items-center justify-between gap-4">
            <div><h2 className="text-xl font-black">Abrir processo de sinistro</h2><p className="mt-1 text-sm text-slate-500">Associe sempre o cliente e, quando possível, a respetiva apólice.</p></div>
            <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>Fechar</button>
          </div>
          <Field label="Número do sinistro">
            <input className="field" required value={form.claimNumber} onChange={(event) => setForm({ ...form, claimNumber: event.target.value })} />
          </Field>
          <Field label="Cliente">
            <select className="field" required value={form.clientId} onChange={(event) => setForm({ ...form, clientId: Number(event.target.value), policyId: 0 })}>
              <option value={0}>Selecionar…</option>
              {clientsQuery.data?.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
            </select>
          </Field>
          <Field label="Apólice">
            <select className="field" value={form.policyId} onChange={(event) => setForm({ ...form, policyId: Number(event.target.value) })}>
              <option value={0}>Sem apólice associada</option>
              {availablePolicies.map((policy) => <option key={policy.id} value={policy.id}>{policy.policyNumber} · {policy.product}</option>)}
            </select>
          </Field>
          <div className="md:col-span-2">
            <Field label="Descrição e circunstâncias">
              <textarea className="field min-h-28" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Data, local, danos conhecidos, intervenientes e próximos passos…" />
            </Field>
          </div>
          <div className="md:col-span-2 flex justify-end"><button className="btn-primary" disabled={save.isPending}>{save.isPending ? "A guardar…" : "Guardar sinistro"}</button></div>
        </form>
      )}

      <div className="panel p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="flex flex-1 items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
            <Search size={18} className="text-slate-400" />
            <input className="w-full bg-transparent text-sm outline-none" placeholder="Pesquisar sinistro, cliente, apólice ou companhia…" value={search} onChange={(event) => setSearch(event.target.value)} />
          </label>
          <div className="flex flex-wrap gap-2">
            {(["ALL", "OPEN", "IN_PROGRESS", "CLOSED"] as const).map((status) => (
              <button key={status} type="button" onClick={() => setStatusFilter(status)} className={`rounded-xl px-3 py-2 text-xs font-black transition ${statusFilter === status ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                {status === "ALL" ? "Todos" : statusLabels[status]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {claimsQuery.isPending ? (
        <div className="panel p-10 text-center text-slate-400">A carregar sinistros…</div>
      ) : filtered.length ? (
        <div className="grid gap-4">
          {filtered.map((claim) => (
            <Link href={`/claims/${claim.id}`} key={claim.id} className="panel group flex flex-wrap items-center justify-between gap-4 p-5 transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-lg">
              <div className="flex min-w-0 gap-3">
                <div className="rounded-xl bg-amber-50 p-3 text-amber-600"><FileWarning size={21} /></div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-black">{claim.claimNumber}</h2>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${statusClasses[claim.status]}`}>{statusLabels[claim.status]}</span>
                  </div>
                  <p className="mt-1 truncate text-sm text-slate-500">{claim.client.name} · {claim.policy?.policyNumber || "Sem apólice"}{claim.policy?.insurer ? ` · ${claim.policy.insurer.commercialName || claim.policy.insurer.name}` : ""}</p>
                  <p className="mt-2 line-clamp-2 max-w-3xl text-xs leading-5 text-slate-400">{claim.description || "Sem descrição."}</p>
                </div>
              </div>
              <div className="text-right"><p className="text-xs text-slate-400">Atualizado</p><p className="mt-1 text-sm font-bold text-slate-600">{formatDate(claim.updatedAt)}</p><p className="mt-2 text-xs font-black text-cyan-700 opacity-0 transition group-hover:opacity-100">Abrir processo →</p></div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="panel p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600"><FileWarning /></div>
          <h2 className="mt-4 text-lg font-black">{claims.length ? "Nenhum sinistro corresponde aos filtros" : "Ainda não existem sinistros"}</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">Registe o primeiro processo para acompanhar contactos, apólice, companhia e evolução do sinistro.</p>
          {!claims.length && <button className="btn-primary mt-5" onClick={openForm}><Plus size={16} />Criar primeiro sinistro</button>}
        </div>
      )}
    </div>
  );
}

function Kpi({ icon: Icon, label, value, className }: { icon: typeof ShieldAlert; label: string; value: number; className: string }) {
  return <div className="panel flex items-center gap-4 p-5"><div className={`rounded-2xl p-3 ${className}`}><Icon size={21} /></div><div><p className="text-2xl font-black">{value}</p><p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p></div></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>{children}</label>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}
