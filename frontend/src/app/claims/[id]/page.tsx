"use client";

import { type FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, FileWarning, Mail, Phone, ShieldCheck, UserRound } from "lucide-react";
import { apiError } from "@/lib/api-error";
import { getClaim, updateClaim, type ClaimStatus } from "@/services/claims";

const labels: Record<ClaimStatus, string> = { OPEN: "Aberto", IN_PROGRESS: "Em curso", CLOSED: "Encerrado" };

export default function ClaimDetailPage() {
  const params = useParams();
  const id = Number(Array.isArray(params.id) ? params.id[0] : params.id);
  const queryClient = useQueryClient();
  const claimQuery = useQuery({ queryKey: ["claim", id], queryFn: () => getClaim(id), enabled: id > 0 });
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ClaimStatus>("OPEN");

  useEffect(() => {
    if (claimQuery.data) {
      setDescription(claimQuery.data.description ?? "");
      setStatus(claimQuery.data.status);
    }
  }, [claimQuery.data]);

  const save = useMutation({
    mutationFn: () => updateClaim(id, { description: description.trim() || null, status }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["claim", id] }),
        queryClient.invalidateQueries({ queryKey: ["claims"] }),
      ]);
    },
  });

  if (claimQuery.isPending) return <div className="panel p-8 text-slate-400">A carregar sinistro…</div>;
  if (claimQuery.error || !claimQuery.data) return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-700">{apiError(claimQuery.error, "Sinistro não encontrado.")}</div>;

  const claim = claimQuery.data;

  function submit(event: FormEvent) {
    event.preventDefault();
    save.mutate();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/claims" className="text-sm font-bold text-cyan-700">← Voltar aos sinistros</Link>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-amber-50 p-4 text-amber-600"><FileWarning size={28} /></div>
            <div><p className="eyebrow">Processo de sinistro</p><h1 className="mt-1 text-3xl font-black">{claim.claimNumber}</h1></div>
          </div>
          <span className="rounded-full bg-slate-900 px-4 py-2 text-xs font-black text-white">{labels[claim.status]}</span>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_.8fr]">
        <form onSubmit={submit} className="panel p-6">
          <h2 className="text-xl font-black">Acompanhamento do processo</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label><span className="mb-2 block text-sm font-bold">Estado</span><select className="field" value={status} onChange={(event) => setStatus(event.target.value as ClaimStatus)}><option value="OPEN">Aberto</option><option value="IN_PROGRESS">Em curso</option><option value="CLOSED">Encerrado</option></select></label>
            <Info label="Última atualização" value={formatDate(claim.updatedAt)} />
            <div className="sm:col-span-2"><label><span className="mb-2 block text-sm font-bold">Descrição, comunicações e próximos passos</span><textarea className="field min-h-52" value={description} onChange={(event) => setDescription(event.target.value)} /></label></div>
          </div>
          {save.error && <div className="mt-4 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{apiError(save.error)}</div>}
          <div className="mt-5 flex justify-end"><button className="btn-primary" disabled={save.isPending}>{save.isPending ? "A guardar…" : "Guardar alterações"}</button></div>
        </form>

        <div className="space-y-6">
          <section className="panel p-6">
            <div className="flex items-center gap-3"><UserRound className="text-cyan-700" /><h2 className="text-xl font-black">Cliente</h2></div>
            <Link href={`/clients/${claim.client.id}`} className="mt-5 block rounded-2xl border border-slate-200 p-4 hover:border-cyan-300 hover:bg-cyan-50/40">
              <p className="font-black">{claim.client.name}</p>
              {claim.client.nif && <p className="mt-1 text-sm text-slate-500">NIF {claim.client.nif}</p>}
              <div className="mt-3 space-y-1 text-sm text-slate-500">{claim.client.phone && <p className="flex items-center gap-2"><Phone size={14} />{claim.client.phone}</p>}{claim.client.email && <p className="flex items-center gap-2"><Mail size={14} />{claim.client.email}</p>}</div>
            </Link>
          </section>

          <section className="panel p-6">
            <div className="flex items-center gap-3"><ShieldCheck className="text-cyan-700" /><h2 className="text-xl font-black">Apólice</h2></div>
            {claim.policy ? (
              <Link href={`/policies/${claim.policy.id}`} className="mt-5 block rounded-2xl border border-slate-200 p-4 hover:border-cyan-300 hover:bg-cyan-50/40">
                <p className="font-black">{claim.policy.policyNumber}</p>
                <p className="mt-1 text-sm text-slate-500">{claim.policy.product}</p>
                {claim.policy.insurer && <p className="mt-3 text-sm font-bold text-cyan-700">{claim.policy.insurer.commercialName || claim.policy.insurer.name}</p>}
              </Link>
            ) : <p className="mt-5 rounded-xl border border-dashed p-4 text-sm text-slate-400">Sem apólice associada.</p>}
          </section>

          <section className="panel p-6">
            <div className="flex items-center gap-3"><CalendarClock className="text-cyan-700" /><h2 className="text-xl font-black">Histórico</h2></div>
            <div className="mt-5 space-y-4 border-l-2 border-slate-100 pl-5 text-sm"><div><p className="font-bold">Processo criado</p><p className="text-slate-400">{formatDateTime(claim.createdAt)}</p></div><div><p className="font-bold">Última atualização</p><p className="text-slate-400">{formatDateTime(claim.updatedAt)}</p></div></div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><p className="text-sm font-bold">{label}</p><p className="mt-2 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">{value}</p></div>;
}
function formatDate(value: string) { return new Intl.DateTimeFormat("pt-PT").format(new Date(value)); }
function formatDateTime(value: string) { return new Intl.DateTimeFormat("pt-PT", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
