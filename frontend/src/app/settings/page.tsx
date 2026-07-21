"use client";

import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, CheckCircle2, KeyRound, Save, UserRound } from "lucide-react";
import AvatarPicker from "@/components/profile/AvatarPicker";
import { apiError } from "@/lib/api-error";
import { useAuth } from "@/providers/AuthProvider";
import { api } from "@/services/api";
import { PERMISSIONS } from "@/config/permissions";
import { getCurrentCompany, updateCurrentCompany, type CompanySettings } from "@/services/company";

export default function SettingsPage() {
  const { user, can, isSuperAdmin, refreshUser, logout } = useAuth();
  const canManageOrganization = can(PERMISSIONS.ORGANIZATION_MANAGE) && !isSuperAdmin;
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState({ name: "", phone: "", jobTitle: "", avatarUrl: "" });
  const [company, setCompany] = useState<Partial<CompanySettings>>({});
  const [password, setPassword] = useState({ currentPassword: "", newPassword: "" });
  const [success, setSuccess] = useState("");

  const companyQuery = useQuery({
    queryKey: ["company-current"],
    queryFn: getCurrentCompany,
    enabled: canManageOrganization,
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name,
        phone: user.phone || "",
        jobTitle: user.jobTitle || "",
        avatarUrl: user.avatarUrl || "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (companyQuery.data) setCompany(companyQuery.data);
  }, [companyQuery.data]);

  const profileMutation = useMutation({
    mutationFn: () => api.patch("/auth/profile", {
      name: profile.name,
      phone: profile.phone || null,
      jobTitle: profile.jobTitle || null,
      avatarUrl: profile.avatarUrl || null,
    }),
    onSuccess: async () => {
      await refreshUser();
      setSuccess("Perfil atualizado com sucesso.");
    },
  });

  const companyMutation = useMutation({
    mutationFn: () => updateCurrentCompany(company),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["company-current"] }),
        refreshUser(),
      ]);
      setSuccess("Dados da mediadora atualizados com sucesso.");
    },
  });

  const passwordMutation = useMutation({
    mutationFn: () => api.patch("/auth/password", password),
    onSuccess: () => void logout(),
  });

  const anyError = profileMutation.error || companyMutation.error || passwordMutation.error || companyQuery.error;

  function submitProfile(event: FormEvent) {
    event.preventDefault();
    setSuccess("");
    profileMutation.mutate();
  }

  function submitCompany(event: FormEvent) {
    event.preventDefault();
    setSuccess("");
    companyMutation.mutate();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Preferências e administração</p>
        <h1 className="mt-1 text-3xl font-black">Configuração</h1>
        <p className="mt-2 text-sm text-slate-500">Cada utilizador gere o próprio perfil. A administração gere também os dados internos da mediadora.</p>
      </div>

      {success && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          <CheckCircle2 size={18} /> {success}
        </div>
      )}
      {anyError && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{apiError(anyError)}</div>}

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="panel p-6">
          <SectionTitle icon={UserRound} title="O meu perfil" text="Informação visível dentro da equipa e nos processos atribuídos." />
          <form className="mt-6 space-y-5" onSubmit={submitProfile}>
            <AvatarPicker value={profile.avatarUrl} name={profile.name} onChange={(avatarUrl) => setProfile({ ...profile, avatarUrl })} disabled={profileMutation.isPending} />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2"><Field label="Nome"><input className="field" value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} required /></Field></div>
              <Field label="Telefone"><input className="field" value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} /></Field>
              <Field label="Função"><input className="field" value={profile.jobTitle} onChange={(event) => setProfile({ ...profile, jobTitle: event.target.value })} placeholder="Gestor de clientes" /></Field>
            </div>
            <div className="flex justify-end"><button className="btn-primary" disabled={profileMutation.isPending}><Save size={17} />{profileMutation.isPending ? "A guardar…" : "Guardar perfil"}</button></div>
          </form>
        </section>

        <section className="panel p-6">
          <SectionTitle icon={KeyRound} title="Segurança" text="Altere a sua palavra-passe individual." />
          <form className="mt-6 space-y-4" onSubmit={(event) => { event.preventDefault(); passwordMutation.mutate(); }}>
            <Field label="Palavra-passe atual"><input type="password" className="field" value={password.currentPassword} onChange={(event) => setPassword({ ...password, currentPassword: event.target.value })} required /></Field>
            <Field label="Nova palavra-passe"><input type="password" className="field" minLength={8} value={password.newPassword} onChange={(event) => setPassword({ ...password, newPassword: event.target.value })} required /></Field>
            <button className="btn-secondary" disabled={passwordMutation.isPending}>{passwordMutation.isPending ? "A alterar…" : "Alterar palavra-passe"}</button>
            <p className="text-xs leading-5 text-slate-400">Depois da alteração, todas as sessões são terminadas por segurança.</p>
          </form>
        </section>
      </div>

      {canManageOrganization && (
        <section className="panel p-6">
          <SectionTitle icon={Building2} title="Mediadora / organização" text="Dados internos comuns a todos os utilizadores da empresa." />
          {companyQuery.isPending ? <p className="mt-6 text-sm text-slate-400">A carregar empresa…</p> : (
            <form className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3" onSubmit={submitCompany}>
              <Field label="Nome comercial"><input className="field" value={company.name || ""} onChange={(event) => setCompany({ ...company, name: event.target.value })} /></Field>
              <Field label="NIF"><input className="field" value={company.nif || ""} onChange={(event) => setCompany({ ...company, nif: event.target.value })} /></Field>
              <Field label="Registo ASF"><input className="field" value={company.asfRegistration || ""} onChange={(event) => setCompany({ ...company, asfRegistration: event.target.value })} /></Field>
              <Field label="Email"><input className="field" type="email" value={company.email || ""} onChange={(event) => setCompany({ ...company, email: event.target.value })} /></Field>
              <Field label="Telefone"><input className="field" value={company.phone || ""} onChange={(event) => setCompany({ ...company, phone: event.target.value })} /></Field>
              <Field label="Website"><input className="field" value={company.website || ""} onChange={(event) => setCompany({ ...company, website: event.target.value })} placeholder="https://..." /></Field>
              <div className="xl:col-span-2"><Field label="Morada"><input className="field" value={company.address || ""} onChange={(event) => setCompany({ ...company, address: event.target.value })} /></Field></div>
              <Field label="Código postal"><input className="field" value={company.postalCode || ""} onChange={(event) => setCompany({ ...company, postalCode: event.target.value })} /></Field>
              <Field label="Localidade"><input className="field" value={company.city || ""} onChange={(event) => setCompany({ ...company, city: event.target.value })} /></Field>
              <div className="xl:col-span-2"><Field label="URL do logótipo"><input className="field" value={company.logoUrl || ""} onChange={(event) => setCompany({ ...company, logoUrl: event.target.value })} placeholder="https://..." /></Field></div>
              <div className="xl:col-span-3 flex justify-end"><button className="btn-primary" disabled={companyMutation.isPending}><Save size={17} />{companyMutation.isPending ? "A guardar…" : "Guardar empresa"}</button></div>
            </form>
          )}
        </section>
      )}
    </div>
  );
}

function SectionTitle({ icon: Icon, title, text }: { icon: React.ElementType; title: string; text: string }) {
  return <div className="flex items-center gap-3"><div className="rounded-xl bg-cyan-50 p-2.5 text-cyan-700"><Icon size={21} /></div><div><h2 className="font-black">{title}</h2><p className="text-xs text-slate-400">{text}</p></div></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>{children}</label>;
}
