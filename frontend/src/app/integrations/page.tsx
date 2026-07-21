"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Cable, CarFront, CheckCircle2, DatabaseZap, KeyRound, RefreshCw, Save, ShieldAlert } from "lucide-react";
import { PERMISSIONS } from "@/config/permissions";
import { apiError } from "@/lib/api-error";
import { useAuth } from "@/providers/AuthProvider";
import {
  getIntegrationInsurers,
  getIntegrationsStatus,
  getPortfolioImports,
  runDemoPortfolioImport,
  runDirectPortfolioImport,
  saveIntegration,
  testIntegration,
  updateOrganizationInsurer,
  type IntegrationInsurer,
} from "@/services/integrations";

const emptySettings = {
  enabled: true,
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

const emptyConnection = {
  mode: "MANUAL" as "MANUAL" | "API" | "WEBSERVICE" | "FILE_IMPORT",
  environment: "SANDBOX" as "SANDBOX" | "PRODUCTION",
  agencyCode: "",
  username: "",
  secret: "",
  endpoint: "",
};

export default function IntegrationsPage() {
  const { can } = useAuth();
  const allowed = can(PERMISSIONS.INTEGRATIONS_MANAGE);
  const canImport = can(PERMISSIONS.PORTFOLIO_IMPORT);
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [settings, setSettings] = useState(emptySettings);
  const [connection, setConnection] = useState(emptyConnection);
  const [message, setMessage] = useState("");

  const statusQuery = useQuery({ queryKey: ["integrations-status"], queryFn: getIntegrationsStatus, enabled: allowed });
  const insurersQuery = useQuery({ queryKey: ["integration-insurers"], queryFn: getIntegrationInsurers, enabled: allowed });
  const importsQuery = useQuery({ queryKey: ["portfolio-imports"], queryFn: getPortfolioImports, enabled: allowed && canImport });

  const selected = useMemo(
    () => insurersQuery.data?.find((item) => item.id === selectedId) || insurersQuery.data?.[0] || null,
    [insurersQuery.data, selectedId],
  );

  useEffect(() => {
    if (!selected) return;
    if (!selectedId) setSelectedId(selected.id);
    const organization = selected.organizationSettings;
    setSettings({
      enabled: organization?.enabled ?? true,
      agencyCode: organization?.agencyCode || "",
      accountManagerName: organization?.accountManagerName || "",
      accountManagerEmail: organization?.accountManagerEmail || "",
      accountManagerPhone: organization?.accountManagerPhone || "",
      agentSupportPhone: organization?.agentSupportPhone || "",
      agentSupportEmail: organization?.agentSupportEmail || "",
      claimsPhone: organization?.claimsPhone || "",
      claimsEmail: organization?.claimsEmail || "",
      assistancePhone: organization?.assistancePhone || "",
      notes: organization?.notes || "",
    });
    const existing = selected.integrations.find((item) => item.environment === connection.environment);
    setConnection((current) => ({
      ...current,
      mode: existing?.mode || "MANUAL",
      agencyCode: existing?.agencyCode || organization?.agencyCode || "",
      username: existing?.username || "",
      secret: "",
      endpoint: "",
    }));
  }, [selected, selectedId, connection.environment]);

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["integrations-status"] }),
      queryClient.invalidateQueries({ queryKey: ["integration-insurers"] }),
      queryClient.invalidateQueries({ queryKey: ["portfolio-imports"] }),
      queryClient.invalidateQueries({ queryKey: ["clients"] }),
      queryClient.invalidateQueries({ queryKey: ["policies"] }),
    ]);
  };

  const saveSettingsMutation = useMutation({
    mutationFn: () => updateOrganizationInsurer(selected!.id, settings),
    onSuccess: async () => { await refresh(); setMessage("Contactos e configuração comercial guardados."); },
  });
  const saveConnectionMutation = useMutation({
    mutationFn: () => saveIntegration(selected!.id, {
      mode: connection.mode,
      environment: connection.environment,
      agencyCode: connection.agencyCode || null,
      username: connection.username || null,
      secret: connection.secret || null,
      config: connection.endpoint ? { endpoint: connection.endpoint } : {},
      capabilities: { quote: true, portfolioImport: connection.mode === "API" || connection.mode === "WEBSERVICE" },
    }),
    onSuccess: async () => { await refresh(); setConnection((current) => ({ ...current, secret: "" })); setMessage("Configuração técnica guardada de forma cifrada."); },
  });
  const testMutation = useMutation({
    mutationFn: () => testIntegration(selected!.id, connection.environment),
    onSuccess: async (result) => { await refresh(); setMessage(result.test?.message || "Teste concluído."); },
  });
  const demoMutation = useMutation({
    mutationFn: () => runDemoPortfolioImport(selected?.id),
    onSuccess: async () => { await refresh(); setMessage("Importação de demonstração concluída. Os clientes e apólices aparecem agora nas respetivas áreas."); },
  });
  const directMutation = useMutation({
    mutationFn: () => runDirectPortfolioImport(selected!.id, connection.mode === "WEBSERVICE" ? "WEBSERVICE" : "API", connection.environment),
    onSuccess: async () => { await refresh(); setMessage("Importação direta concluída."); },
  });

  if (!allowed) {
    return <div className="panel p-8"><ShieldAlert className="text-amber-500" /><h1 className="mt-4 text-2xl font-black">Área reservada</h1><p className="mt-2 text-slate-500">Não tem permissão para gerir credenciais e integrações.</p></div>;
  }

  const error = statusQuery.error || insurersQuery.error || importsQuery.error || saveSettingsMutation.error || saveConnectionMutation.error || testMutation.error || demoMutation.error || directMutation.error;

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Multiempresa e conectores</p>
        <h1 className="mt-1 text-3xl font-black">Integrações e importação de carteira</h1>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-500">Cada mediadora configura apenas o seu código de agente e as suas credenciais. O conector técnico é desenvolvido uma única vez por companhia e reutilizado por todas as empresas.</p>
      </div>

      {message && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">{message}</div>}
      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{apiError(error)}</div>}

      <div className="grid gap-4 md:grid-cols-4">
        <Metric icon={Cable} label="Conectores configurados" value={statusQuery.data?.insurerConnectors.configuredConnectors ?? 0} />
        <Metric icon={CheckCircle2} label="Conectores ativos" value={statusQuery.data?.insurerConnectors.productionConnectors ?? 0} />
        <Metric icon={DatabaseZap} label="Importações realizadas" value={statusQuery.data?.insurerConnectors.portfolioImports ?? 0} />
        <Metric icon={CarFront} label="Pesquisa de matrícula" value={statusQuery.data?.vehicleLookup.configured ? "Ativa" : "Demo"} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <section className="panel overflow-hidden">
          <div className="border-b border-slate-100 p-5"><h2 className="font-black">Companhias</h2><p className="mt-1 text-xs text-slate-400">Selecione para configurar por mediadora.</p></div>
          <div className="max-h-[760px] divide-y divide-slate-100 overflow-y-auto">
            {insurersQuery.data?.map((insurer) => {
              const active = selected?.id === insurer.id;
              const integration = insurer.integrations.find((item) => item.status === "ACTIVE");
              return <button key={insurer.id} onClick={() => setSelectedId(insurer.id)} className={`w-full p-4 text-left transition ${active ? "bg-cyan-50" : "hover:bg-slate-50"}`}>
                <div className="flex items-center justify-between gap-3"><span className="font-black">{insurer.commercialName || insurer.name}</span><span className={`h-2.5 w-2.5 rounded-full ${integration ? "bg-emerald-500" : "bg-slate-300"}`} /></div>
                <p className="mt-1 text-xs text-slate-400">{insurer.organizationSettings?.agencyCode ? `Agente ${insurer.organizationSettings.agencyCode}` : "Código de agente por definir"}</p>
              </button>;
            })}
          </div>
        </section>

        {selected && <div className="space-y-6">
          <section className="panel p-6">
            <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="eyebrow">Configuração comercial</p><h2 className="mt-1 text-2xl font-black">{selected.commercialName || selected.name}</h2></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">Catálogo global + dados privados da mediadora</span></div>
            <form onSubmit={(event: FormEvent) => { event.preventDefault(); saveSettingsMutation.mutate(); }} className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Field label="Código de agente"><input className="field" value={settings.agencyCode} onChange={(event) => setSettings({ ...settings, agencyCode: event.target.value })} /></Field>
              <Field label="Comercial responsável"><input className="field" value={settings.accountManagerName} onChange={(event) => setSettings({ ...settings, accountManagerName: event.target.value })} /></Field>
              <Field label="Telefone do comercial"><input className="field" value={settings.accountManagerPhone} onChange={(event) => setSettings({ ...settings, accountManagerPhone: event.target.value })} /></Field>
              <Field label="Email do comercial"><input className="field" type="email" value={settings.accountManagerEmail} onChange={(event) => setSettings({ ...settings, accountManagerEmail: event.target.value })} /></Field>
              <Field label="Linha de agentes"><input className="field" value={settings.agentSupportPhone} onChange={(event) => setSettings({ ...settings, agentSupportPhone: event.target.value })} /></Field>
              <Field label="Email de apoio a agentes"><input className="field" type="email" value={settings.agentSupportEmail} onChange={(event) => setSettings({ ...settings, agentSupportEmail: event.target.value })} /></Field>
              <Field label="Linha de sinistros"><input className="field" value={settings.claimsPhone} onChange={(event) => setSettings({ ...settings, claimsPhone: event.target.value })} /></Field>
              <Field label="Email de sinistros"><input className="field" type="email" value={settings.claimsEmail} onChange={(event) => setSettings({ ...settings, claimsEmail: event.target.value })} /></Field>
              <Field label="Assistência"><input className="field" value={settings.assistancePhone} onChange={(event) => setSettings({ ...settings, assistancePhone: event.target.value })} /></Field>
              <div className="md:col-span-2 xl:col-span-3"><Field label="Notas internas"><textarea className="field min-h-24" value={settings.notes} onChange={(event) => setSettings({ ...settings, notes: event.target.value })} /></Field></div>
              <div className="md:col-span-2 xl:col-span-3 flex justify-end"><button className="btn-primary" disabled={saveSettingsMutation.isPending}><Save size={17} />Guardar contactos</button></div>
            </form>
          </section>

          <section className="panel p-6">
            <div className="flex items-center gap-3"><div className="rounded-xl bg-cyan-50 p-2.5 text-cyan-700"><KeyRound size={20} /></div><div><h2 className="font-black">Ligação técnica</h2><p className="text-xs text-slate-400">As palavras-passe e tokens são cifrados no backend e nunca regressam ao navegador.</p></div></div>
            <form onSubmit={(event) => { event.preventDefault(); saveConnectionMutation.mutate(); }} className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Field label="Modo"><select className="field" value={connection.mode} onChange={(event) => setConnection({ ...connection, mode: event.target.value as typeof connection.mode })}><option value="MANUAL">Manual assistido</option><option value="API">API</option><option value="WEBSERVICE">Webservice</option><option value="FILE_IMPORT">Importação de ficheiro</option></select></Field>
              <Field label="Ambiente"><select className="field" value={connection.environment} onChange={(event) => setConnection({ ...connection, environment: event.target.value as typeof connection.environment })}><option value="SANDBOX">Testes / Sandbox</option><option value="PRODUCTION">Produção</option></select></Field>
              <Field label="Código de agente"><input className="field" value={connection.agencyCode} onChange={(event) => setConnection({ ...connection, agencyCode: event.target.value })} /></Field>
              <Field label="Utilizador técnico"><input className="field" value={connection.username} onChange={(event) => setConnection({ ...connection, username: event.target.value })} /></Field>
              <Field label="Segredo / token"><input className="field" type="password" value={connection.secret} onChange={(event) => setConnection({ ...connection, secret: event.target.value })} placeholder="Deixe vazio para manter o atual" /></Field>
              <Field label="Endpoint fornecido pela companhia"><input className="field" value={connection.endpoint} onChange={(event) => setConnection({ ...connection, endpoint: event.target.value })} placeholder="https://api..." /></Field>
              <div className="md:col-span-2 xl:col-span-3 flex flex-wrap justify-end gap-2"><button type="button" className="btn-secondary" onClick={() => testMutation.mutate()} disabled={testMutation.isPending}><RefreshCw size={16} />Testar</button><button className="btn-primary" disabled={saveConnectionMutation.isPending}><Save size={17} />Guardar ligação</button></div>
            </form>
          </section>

          {canImport && <section className="panel p-6">
            <div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="font-black">Importação de carteira</h2><p className="mt-1 text-xs leading-5 text-slate-500">Quando a companhia disponibilizar um endpoint de carteira, o InsureFlow lê clientes e apólices diretamente. Para companhias sem API, mantém-se Excel/CSV ou registo assistido.</p></div><div className="flex flex-wrap gap-2"><button className="btn-secondary" onClick={() => demoMutation.mutate()} disabled={demoMutation.isPending}><DatabaseZap size={16} />Testar importação demo</button><button className="btn-primary" onClick={() => directMutation.mutate()} disabled={directMutation.isPending || connection.mode === "MANUAL" || connection.mode === "FILE_IMPORT"}><RefreshCw size={16} />Importar da companhia</button></div></div>
            <div className="mt-5 overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left text-xs uppercase tracking-wide text-slate-400"><th className="py-3">Data</th><th>Companhia</th><th>Origem</th><th>Estado</th><th className="text-right">Novos</th><th className="text-right">Atualizados</th><th className="text-right">Falhas</th></tr></thead><tbody>{importsQuery.data?.map((job) => <tr key={job.id} className="border-b border-slate-100"><td className="py-3">{new Date(job.createdAt).toLocaleString("pt-PT")}</td><td>{job.insurer?.commercialName || job.insurer?.name || "Demonstração"}</td><td>{job.source}</td><td><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold">{job.status}</span></td><td className="text-right font-bold text-emerald-700">{job.importedRecords}</td><td className="text-right font-bold text-cyan-700">{job.updatedRecords || 0}</td><td className="text-right font-bold text-rose-600">{job.failedRecords}</td></tr>)}</tbody></table></div>
          </section>}
        </div>}
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return <div className="panel p-5"><div className="flex items-center gap-3"><div className="rounded-xl bg-cyan-50 p-2.5 text-cyan-700"><Icon size={20} /></div><div><p className="text-xs font-bold text-slate-400">{label}</p><p className="mt-1 text-2xl font-black">{value}</p></div></div></div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>{children}</label>; }
