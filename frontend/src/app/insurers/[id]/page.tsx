"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  ExternalLink,
  Headphones,
  Mail,
  Pencil,
  Phone,
  Save,
  ShieldAlert,
  UserRound,
  X,
} from "lucide-react";
import { getInsurer } from "@/services/insurers";
import { updateOrganizationInsurer } from "@/services/integrations";
import { apiError } from "@/lib/api-error";
import { useAuth } from "@/providers/AuthProvider";

const contactLabels: Record<string, string> = {
  ACCOUNT_MANAGER: "Gestor de conta",
  COMMERCIAL: "Comercial de apoio",
  SUPPORT: "Linha de agentes",
  CLAIMS: "Apoio a sinistros",
  ASSISTANCE: "Assistência",
  OTHER: "Outro contacto",
};

const productLabels: Record<string, string> = {
  AUTO: "Automóvel",
  MOTORCYCLE: "Moto",
  HOME: "Habitação",
  LIFE: "Vida Crédito",
  HEALTH: "Saúde",
  WORK_ACCIDENT: "Acidentes de Trabalho",
  BUSINESS: "Empresas",
  TRAVEL: "Viagem",
};

type DirectoryForm = {
  agencyCode: string;
  accountManagerName: string;
  accountManagerEmail: string;
  accountManagerPhone: string;
  agentSupportPhone: string;
  agentSupportEmail: string;
  claimsPhone: string;
  claimsEmail: string;
  assistancePhone: string;
  notes: string;
};

const emptyDirectory: DirectoryForm = {
  agencyCode: "",
  accountManagerName: "",
  accountManagerEmail: "",
  accountManagerPhone: "",
  agentSupportPhone: "",
  agentSupportEmail: "",
  claimsPhone: "",
  claimsEmail: "",
  assistancePhone: "",
  notes: "",
};

export default function InsurerDetailPage() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const params = useParams();
  const id = Number(Array.isArray(params.id) ? params.id[0] : params.id);
  const [editingDirectory, setEditingDirectory] = useState(false);
  const [directory, setDirectory] = useState<DirectoryForm>(emptyDirectory);

  const insurerQuery = useQuery({
    queryKey: ["insurer", id],
    queryFn: () => getInsurer(id),
    enabled: id > 0,
  });

  const insurer = insurerQuery.data;

  useEffect(() => {
    const settings = insurer?.organizationSettings;
    setDirectory({
      agencyCode: settings?.agencyCode ?? "",
      accountManagerName: settings?.accountManagerName ?? "",
      accountManagerEmail: settings?.accountManagerEmail ?? "",
      accountManagerPhone: settings?.accountManagerPhone ?? "",
      agentSupportPhone: settings?.agentSupportPhone ?? "",
      agentSupportEmail: settings?.agentSupportEmail ?? "",
      claimsPhone: settings?.claimsPhone ?? "",
      claimsEmail: settings?.claimsEmail ?? "",
      assistancePhone: settings?.assistancePhone ?? "",
      notes: settings?.notes ?? "",
    });
  }, [insurer]);

  const saveDirectory = useMutation({
    mutationFn: () => updateOrganizationInsurer(id, {
      enabled: true,
      agencyCode: nullable(directory.agencyCode),
      accountManagerName: nullable(directory.accountManagerName),
      accountManagerEmail: nullable(directory.accountManagerEmail),
      accountManagerPhone: nullable(directory.accountManagerPhone),
      agentSupportPhone: nullable(directory.agentSupportPhone),
      agentSupportEmail: nullable(directory.agentSupportEmail),
      claimsPhone: nullable(directory.claimsPhone),
      claimsEmail: nullable(directory.claimsEmail),
      assistancePhone: nullable(directory.assistancePhone),
      notes: nullable(directory.notes),
    }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["insurer", id] }),
        queryClient.invalidateQueries({ queryKey: ["insurers"] }),
        queryClient.invalidateQueries({ queryKey: ["integrations"] }),
      ]);
      setEditingDirectory(false);
    },
  });

  const directoryCards = useMemo(() => [
    {
      type: "COMMERCIAL",
      title: "Comercial responsável",
      name: directory.accountManagerName,
      phone: directory.accountManagerPhone,
      email: directory.accountManagerEmail,
      icon: UserRound,
    },
    {
      type: "SUPPORT",
      title: "Linha de agentes",
      name: "Apoio à mediação",
      phone: directory.agentSupportPhone,
      email: directory.agentSupportEmail,
      icon: Headphones,
    },
    {
      type: "CLAIMS",
      title: "Linha de sinistros",
      name: "Apoio a sinistros",
      phone: directory.claimsPhone,
      email: directory.claimsEmail,
      icon: ShieldAlert,
    },
  ], [directory]);

  if (insurerQuery.isPending) {
    return <div className="panel p-8 text-slate-400">A carregar companhia…</div>;
  }

  if (insurerQuery.error || !insurer) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-700">
        {apiError(insurerQuery.error, "Companhia não encontrada.")}
      </div>
    );
  }

  const links = Object.entries(insurer.quoteLinks || {});

  function submitDirectory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveDirectory.mutate();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/insurers" className="text-sm font-bold text-cyan-700">← Voltar às companhias</Link>
          <div className="mt-3 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 text-xl font-black text-white">
              {(insurer.commercialName || insurer.name).slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-black">{insurer.commercialName || insurer.name}</h1>
              <p className="mt-1 text-sm text-slate-500">{insurer.name}</p>
            </div>
          </div>
        </div>
        {isAdmin && <Link href={`/insurers/${insurer.id}/edit`} className="btn-secondary">Editar companhia</Link>}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_.8fr]">
        <section className="panel p-6">
          <h2 className="text-xl font-black">Informação geral</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Info label="Telefone" value={insurer.phone} />
            <Info label="Email" value={insurer.email} />
            <Info label="NIF" value={insurer.nif} />
            <Info label="Código ASF" value={insurer.asfCode} />
            <Info label="Morada" value={[insurer.address, insurer.postalCode, insurer.city].filter(Boolean).join(", ") || null} />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {insurer.website && <ExternalButton href={insurer.website} label="Website" />}
            {insurer.agentPortalUrl && <ExternalButton href={insurer.agentPortalUrl} label="Portal de agentes" />}
            {insurer.claimsPortalUrl && <ExternalButton href={insurer.claimsPortalUrl} label="Portal de sinistros" />}
          </div>
          {insurer.notes && <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">{insurer.notes}</p>}
        </section>

        <section className="panel p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-cyan-50 p-2 text-cyan-700"><Building2 /></div>
            <div>
              <h2 className="font-black">Simuladores e acessos</h2>
              <p className="text-xs text-slate-400">Atalhos autorizados da companhia.</p>
            </div>
          </div>
          {links.length ? (
            <div className="mt-5 grid gap-3">
              {links.map(([product, url]) => (
                <a key={product} href={url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl border border-slate-200 p-4 font-bold transition hover:border-cyan-300 hover:bg-cyan-50">
                  <span>{productLabels[product] || product}</span><ExternalLink size={17} className="text-cyan-700" />
                </a>
              ))}
            </div>
          ) : (
            <p className="mt-5 rounded-xl border border-dashed border-slate-200 p-5 text-sm text-slate-400">Ainda não existem simuladores configurados.</p>
          )}
        </section>
      </div>

      <section className="panel p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Diretório interno</p>
            <h2 className="mt-1 text-xl font-black">Contactos de apoio ao mediador</h2>
            <p className="mt-1 text-sm text-slate-500">Informação privada e específica da sua mediadora.</p>
          </div>
          {isAdmin && !editingDirectory && (
            <button type="button" onClick={() => setEditingDirectory(true)} className="btn-secondary"><Pencil size={16} /> Editar contactos</button>
          )}
        </div>

        {editingDirectory ? (
          <form onSubmit={submitDirectory} className="mt-6 rounded-2xl border border-cyan-200 bg-cyan-50/40 p-5">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <Field label="Código de agente">
                <input className="field" value={directory.agencyCode} onChange={(event) => setDirectory({ ...directory, agencyCode: event.target.value })} />
              </Field>
              <Field label="Nome do comercial">
                <input className="field" value={directory.accountManagerName} onChange={(event) => setDirectory({ ...directory, accountManagerName: event.target.value })} placeholder="Nome do comercial responsável" />
              </Field>
              <Field label="Telefone do comercial">
                <input className="field" value={directory.accountManagerPhone} onChange={(event) => setDirectory({ ...directory, accountManagerPhone: event.target.value })} />
              </Field>
              <Field label="Email do comercial">
                <input type="email" className="field" value={directory.accountManagerEmail} onChange={(event) => setDirectory({ ...directory, accountManagerEmail: event.target.value })} />
              </Field>
              <Field label="Telefone da linha de agentes">
                <input className="field" value={directory.agentSupportPhone} onChange={(event) => setDirectory({ ...directory, agentSupportPhone: event.target.value })} />
              </Field>
              <Field label="Email da linha de agentes">
                <input type="email" className="field" value={directory.agentSupportEmail} onChange={(event) => setDirectory({ ...directory, agentSupportEmail: event.target.value })} />
              </Field>
              <Field label="Telefone de sinistros">
                <input className="field" value={directory.claimsPhone} onChange={(event) => setDirectory({ ...directory, claimsPhone: event.target.value })} />
              </Field>
              <Field label="Email de sinistros">
                <input type="email" className="field" value={directory.claimsEmail} onChange={(event) => setDirectory({ ...directory, claimsEmail: event.target.value })} />
              </Field>
              <Field label="Assistência">
                <input className="field" value={directory.assistancePhone} onChange={(event) => setDirectory({ ...directory, assistancePhone: event.target.value })} />
              </Field>
              <div className="md:col-span-2 xl:col-span-3">
                <Field label="Notas internas">
                  <textarea className="field min-h-24" value={directory.notes} onChange={(event) => setDirectory({ ...directory, notes: event.target.value })} />
                </Field>
              </div>
            </div>
            {saveDirectory.error && <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{apiError(saveDirectory.error)}</div>}
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setEditingDirectory(false)} className="btn-secondary"><X size={16} /> Cancelar</button>
              <button type="submit" disabled={saveDirectory.isPending} className="btn-primary"><Save size={16} /> {saveDirectory.isPending ? "A guardar…" : "Guardar diretório"}</button>
            </div>
          </form>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {directoryCards.map((card) => {
              const Icon = card.icon;
              const empty = !card.phone && !card.email && !card.name;
              return (
                <article key={card.type} className="rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-start justify-between">
                    <div className="rounded-xl bg-slate-100 p-2 text-slate-600"><Icon size={19} /></div>
                    <span className="rounded-full bg-cyan-50 px-2 py-1 text-[10px] font-black text-cyan-700">{card.title}</span>
                  </div>
                  <h3 className="mt-4 font-black">{card.name || card.title}</h3>
                  <div className="mt-4 space-y-2 text-sm">
                    {card.phone && <p className="flex items-center gap-2"><Phone size={15} className="text-cyan-700" />{card.phone}</p>}
                    {card.email && <p className="flex items-center gap-2 break-all"><Mail size={15} className="text-cyan-700" />{card.email}</p>}
                    {empty && <p className="text-slate-400">Contacto por preencher pela administração.</p>}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {directory.notes && !editingDirectory && <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">{directory.notes}</p>}

        {!!insurer.contacts?.length && (
          <details className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
            <summary className="cursor-pointer text-sm font-black text-slate-700">Contactos gerais disponibilizados pela companhia</summary>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {insurer.contacts.map((contact) => (
                <div key={contact.id} className="rounded-xl bg-white p-4 text-sm shadow-sm">
                  <p className="font-black">{contact.department || contactLabels[contact.type]}</p>
                  <p className="mt-1 text-slate-500">{contact.name || "Nome por preencher"}</p>
                  {(contact.phone || contact.mobile) && <p className="mt-2">{contact.phone || contact.mobile}</p>}
                  {contact.email && <p className="mt-1 break-all text-cyan-700">{contact.email}</p>}
                </div>
              ))}
            </div>
          </details>
        )}
      </section>

      <section className="panel overflow-hidden">
        <div className="border-b border-slate-100 p-5"><h2 className="text-xl font-black">Apólices associadas ({insurer._count?.policies ?? 0})</h2></div>
        {!insurer.policies?.length ? (
          <p className="p-6 text-slate-500">Sem apólices.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {insurer.policies.map((policy: any) => (
              <Link href={`/policies/${policy.id}`} key={policy.id} className="flex items-center justify-between gap-4 p-5 hover:bg-slate-50">
                <div><p className="font-black">{policy.policyNumber}</p><p className="mt-1 text-sm text-slate-500">{policy.client.name} · {policy.product}</p></div>
                <span className="text-sm font-bold text-cyan-700">Abrir →</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function nullable(value: string) {
  return value.trim() || null;
}

function Info({ label, value }: { label: string; value: string | null | undefined }) {
  return <div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 font-semibold text-slate-800">{value || "Por preencher"}</p></div>;
}

function ExternalButton({ href, label }: { href: string; label: string }) {
  return <a href={href} target="_blank" rel="noreferrer" className="btn-secondary"><ExternalLink size={16} />{label}</a>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>{children}</label>;
}
