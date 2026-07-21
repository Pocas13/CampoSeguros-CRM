"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, CheckCircle2, CirclePause, Plus, ShieldCheck, Users } from "lucide-react";
import { apiError } from "@/lib/api-error";
import {
  createOrganization,
  listOrganizations,
  updateOrganization,
  type CreateOrganizationInput,
  type OrganizationStatus,
} from "@/services/platform";

const emptyForm: CreateOrganizationInput = {
  name: "",
  nif: "",
  email: "",
  phone: "",
  asfRegistration: "",
  plan: "STARTER",
  status: "TRIAL",
  maxUsers: 5,
  maxClients: 1000,
  adminName: "",
  adminEmail: "",
  adminPassword: "",
};

export default function OrganizationsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateOrganizationInput>(emptyForm);
  const [message, setMessage] = useState("");

  const query = useQuery({ queryKey: ["platform-organizations"], queryFn: listOrganizations, retry: false });

  const createMutation = useMutation({
    mutationFn: createOrganization,
    onSuccess: async () => {
      setForm(emptyForm);
      setShowForm(false);
      setMessage("Mediadora e administrador criados com sucesso.");
      await queryClient.invalidateQueries({ queryKey: ["platform-organizations"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrganizationStatus }) => updateOrganization(id, { status }),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["platform-organizations"] }),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    createMutation.mutate({
      ...form,
      name: form.name.trim(),
      nif: form.nif?.trim() || undefined,
      email: form.email?.trim() || undefined,
      phone: form.phone?.trim() || undefined,
      asfRegistration: form.asfRegistration?.trim() || undefined,
      adminName: form.adminName.trim(),
      adminEmail: form.adminEmail.trim().toLowerCase(),
    });
  }

  const error = query.error || createMutation.error || updateMutation.error;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Administração da plataforma</p>
          <h1 className="mt-1 text-3xl font-black">Mediadoras</h1>
          <p className="mt-2 text-sm text-slate-500">Crie organizações isoladas, defina limites e suspenda acessos sem eliminar dados.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm((value) => !value)}><Plus size={17} /> Nova mediadora</button>
      </div>

      {message && <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700"><CheckCircle2 size={18} /> {message}</div>}
      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{apiError(error)}</div>}

      {showForm && (
        <form className="panel grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3" onSubmit={submit}>
          <div className="xl:col-span-3"><h2 className="text-lg font-black">Nova mediadora e primeiro administrador</h2></div>
          <Field label="Nome da mediadora"><input className="field" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="NIF"><input className="field" value={form.nif} onChange={(e) => setForm({ ...form, nif: e.target.value })} /></Field>
          <Field label="Registo ASF"><input className="field" value={form.asfRegistration} onChange={(e) => setForm({ ...form, asfRegistration: e.target.value })} /></Field>
          <Field label="Email da empresa"><input type="email" className="field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="Telefone"><input className="field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field label="Plano"><select className="field" value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })}><option>STARTER</option><option>PRO</option><option>BUSINESS</option><option>ENTERPRISE</option></select></Field>
          <Field label="Máximo de utilizadores"><input type="number" min={1} className="field" value={form.maxUsers} onChange={(e) => setForm({ ...form, maxUsers: Number(e.target.value) })} /></Field>
          <Field label="Máximo de clientes"><input type="number" min={1} className="field" value={form.maxClients} onChange={(e) => setForm({ ...form, maxClients: Number(e.target.value) })} /></Field>
          <div />
          <Field label="Nome do administrador"><input className="field" required value={form.adminName} onChange={(e) => setForm({ ...form, adminName: e.target.value })} /></Field>
          <Field label="Email do administrador"><input type="email" className="field" required value={form.adminEmail} onChange={(e) => setForm({ ...form, adminEmail: e.target.value })} /></Field>
          <Field label="Palavra-passe inicial"><input type="password" minLength={8} className="field" required value={form.adminPassword} onChange={(e) => setForm({ ...form, adminPassword: e.target.value })} /></Field>
          <div className="xl:col-span-3 flex justify-end gap-3"><button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button><button className="btn-primary" disabled={createMutation.isPending}>{createMutation.isPending ? "A criar…" : "Criar mediadora"}</button></div>
        </form>
      )}

      {query.isPending ? <div className="panel animate-pulse p-8 text-slate-400">A carregar mediadoras…</div> : (
        <div className="grid gap-4 xl:grid-cols-2">
          {(query.data || []).map((org) => (
            <article key={org.id} className="panel p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 gap-3"><div className="rounded-2xl bg-cyan-50 p-3 text-cyan-700"><Building2 size={22} /></div><div><h2 className="truncate text-lg font-black">{org.name}</h2><p className="text-xs text-slate-400">{org.nif || "Sem NIF"} · {org.plan}</p></div></div>
                <Status status={org.status} />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                <Metric icon={Users} label="Utilizadores" value={org._count.users} />
                <Metric icon={Users} label="Clientes" value={org._count.clients} />
                <Metric icon={ShieldCheck} label="Apólices" value={org._count.policies} />
                <Metric icon={ShieldCheck} label="Cotações" value={org._count.quotes} />
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500">
                <span>Limites: {org.maxUsers} utilizadores · {org.maxClients} clientes</span>
                <button className={org.status === "SUSPENDED" ? "btn-secondary" : "inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 font-bold text-amber-700"} disabled={updateMutation.isPending} onClick={() => updateMutation.mutate({ id: org.id, status: org.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED" })}>
                  <CirclePause size={15} /> {org.status === "SUSPENDED" ? "Reativar" : "Suspender"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>{children}</label>; }
function Metric({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) { return <div className="rounded-xl bg-slate-50 p-3"><Icon size={16} className="text-cyan-700" /><p className="mt-2 text-xl font-black">{value}</p><p className="text-[10px] uppercase tracking-wide text-slate-400">{label}</p></div>; }
function Status({ status }: { status: OrganizationStatus }) { const styles = status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : status === "TRIAL" ? "bg-cyan-100 text-cyan-700" : status === "SUSPENDED" ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-600"; return <span className={`rounded-full px-3 py-1 text-xs font-black ${styles}`}>{status}</span>; }
