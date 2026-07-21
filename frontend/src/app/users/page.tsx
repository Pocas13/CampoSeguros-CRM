"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Copy, Link2, ShieldCheck, UserPlus, UsersRound, X } from "lucide-react";
import AvatarPicker from "@/components/profile/AvatarPicker";
import { PERMISSIONS, PERMISSION_OPTIONS } from "@/config/permissions";
import { apiError } from "@/lib/api-error";
import { useAuth, type UserRole } from "@/providers/AuthProvider";
import {
  cancelInvitation,
  createUser,
  deactivateUser,
  getInvitations,
  getUsers,
  inviteUser,
  updateUser,
  type TeamUser,
} from "@/services/users";

const roles: { value: UserRole; label: string; text: string }[] = [
  { value: "ADMIN", label: "Administrador", text: "Gestão total da mediadora, equipa, integrações e valores financeiros." },
  { value: "MANAGER", label: "Gestor", text: "Coordena processos e pode receber permissões adicionais." },
  { value: "EMPLOYEE", label: "Utilizador", text: "Trabalho operacional sem acesso automático a comissões ou configuração." },
];

const roleLabel: Record<UserRole, string> = {
  SUPER_ADMIN: "Super administrador",
  ADMIN: "Administrador",
  MANAGER: "Gestor",
  EMPLOYEE: "Utilizador",
};

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "EMPLOYEE" as UserRole,
  permissions: [] as string[],
  phone: "",
  jobTitle: "",
  avatarUrl: "",
};

export default function UsersPage() {
  const { can, user: current } = useAuth();
  const allowed = can(PERMISSIONS.USERS_MANAGE);
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<TeamUser | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [mode, setMode] = useState<"CREATE" | "INVITE">("CREATE");
  const [inviteLink, setInviteLink] = useState("");

  const usersQuery = useQuery({ queryKey: ["users"], queryFn: getUsers, enabled: allowed });
  const invitationsQuery = useQuery({ queryKey: ["user-invitations"], queryFn: getInvitations, enabled: allowed });

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["users"] }),
      queryClient.invalidateQueries({ queryKey: ["user-invitations"] }),
    ]);
  };

  const save = useMutation({
    mutationFn: async () => {
      if (mode === "INVITE" && !editing) {
        return inviteUser({ email: form.email, role: form.role, permissions: form.permissions });
      }
      return editing
        ? updateUser(editing.id, {
            name: form.name,
            email: form.email,
            password: form.password || undefined,
            role: form.role,
            permissions: form.permissions,
            phone: form.phone || null,
            jobTitle: form.jobTitle || null,
            avatarUrl: form.avatarUrl || null,
          })
        : createUser({ ...form, phone: form.phone || null, jobTitle: form.jobTitle || null, avatarUrl: form.avatarUrl || null });
    },
    onSuccess: async (result) => {
      await refresh();
      if (mode === "INVITE" && result && "invitationUrl" in result && result.invitationUrl) {
        setInviteLink(`${window.location.origin}${result.invitationUrl}`);
        setForm(emptyForm);
      } else reset();
    },
  });

  const toggle = useMutation({ mutationFn: (item: TeamUser) => updateUser(item.id, { active: !item.active }), onSuccess: refresh });
  const remove = useMutation({ mutationFn: deactivateUser, onSuccess: refresh });
  const cancel = useMutation({ mutationFn: cancelInvitation, onSuccess: refresh });

  function reset() { setEditing(null); setForm(emptyForm); setInviteLink(""); }
  function edit(item: TeamUser) {
    setMode("CREATE");
    setEditing(item);
    setForm({ name: item.name, email: item.email, password: "", role: item.role, permissions: item.permissions || [], phone: item.phone || "", jobTitle: item.jobTitle || "", avatarUrl: item.avatarUrl || "" });
  }
  function submit(event: FormEvent) { event.preventDefault(); save.mutate(); }
  function togglePermission(permission: string) {
    setForm((currentForm) => ({
      ...currentForm,
      permissions: currentForm.permissions.includes(permission)
        ? currentForm.permissions.filter((item) => item !== permission)
        : [...currentForm.permissions, permission],
    }));
  }

  if (!allowed) return <div className="panel p-8"><ShieldCheck className="text-amber-500" /><h1 className="mt-4 text-2xl font-black">Área reservada à administração</h1><p className="mt-2 text-slate-500">Não tem permissão para gerir acessos.</p></div>;
  if (usersQuery.isPending) return <div className="panel p-8 text-slate-400">A carregar equipa…</div>;

  const error = usersQuery.error || invitationsQuery.error || save.error || toggle.error || remove.error || cancel.error;
  const data = usersQuery.data || [];

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Acessos individuais e rastreáveis</p>
        <h1 className="mt-1 text-3xl font-black">Utilizadores, funções e permissões</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">Cada pessoa deve usar o próprio acesso. Além do nível base, pode receber permissões específicas sem partilhar palavras-passe.</p>
      </div>

      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{apiError(error)}</div>}
      {inviteLink && <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan-200 bg-cyan-50 p-4"><div><p className="font-black text-cyan-900">Convite criado</p><p className="mt-1 break-all text-xs text-cyan-800">{inviteLink}</p></div><button className="btn-secondary" onClick={() => navigator.clipboard.writeText(inviteLink)}><Copy size={16} />Copiar ligação</button></div>}

      <div className="grid gap-6 xl:grid-cols-[1.3fr_.9fr]">
        <div className="space-y-6">
          <section className="panel overflow-hidden">
            <div className="border-b border-slate-100 p-5"><div className="flex items-center gap-3"><div className="rounded-xl bg-cyan-50 p-2 text-cyan-700"><UsersRound /></div><div><h2 className="font-black">Equipa</h2><p className="text-xs text-slate-400">{data.filter((item) => item.active).length} acessos ativos</p></div></div></div>
            <div className="divide-y divide-slate-100">
              {data.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div className="flex min-w-0 items-center gap-3"><UserAvatar user={item} /><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="truncate font-black">{item.name}</p><span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${item.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{item.active ? "ATIVO" : "INATIVO"}</span></div><p className="truncate text-sm text-slate-500">{item.email}</p><p className="mt-1 text-xs text-slate-400">{roleLabel[item.role]} · {item.jobTitle || "Função por definir"} · {item.permissions?.length || 0} permissões extra</p></div></div>
                <div className="flex gap-2"><button onClick={() => edit(item)} className="btn-secondary">Editar</button><button disabled={item.id === current?.id} onClick={() => toggle.mutate(item)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 disabled:opacity-40">{item.active ? "Desativar" : "Ativar"}</button>{item.active && item.id !== current?.id && <button onClick={() => remove.mutate(item.id)} className="rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50">Bloquear</button>}</div>
              </div>)}
            </div>
          </section>

          <section className="panel overflow-hidden">
            <div className="border-b border-slate-100 p-5"><div className="flex items-center gap-3"><div className="rounded-xl bg-indigo-50 p-2 text-indigo-700"><Link2 /></div><div><h2 className="font-black">Convites pendentes</h2><p className="text-xs text-slate-400">Válidos durante sete dias.</p></div></div></div>
            <div className="divide-y divide-slate-100">{invitationsQuery.data?.length ? invitationsQuery.data.map((invite) => <div key={invite.id} className="flex items-center justify-between gap-4 p-4"><div><p className="font-bold">{invite.email}</p><p className="text-xs text-slate-400">{roleLabel[invite.role]} · expira {new Date(invite.expiresAt).toLocaleDateString("pt-PT")}</p></div><button onClick={() => cancel.mutate(invite.id)} className="rounded-xl p-2 text-rose-600 hover:bg-rose-50"><X size={18} /></button></div>) : <p className="p-5 text-sm text-slate-400">Sem convites pendentes.</p>}</div>
          </section>
        </div>

        <section className="panel p-6">
          <div className="flex items-center gap-3"><div className="rounded-xl bg-blue-50 p-2 text-blue-700"><UserPlus /></div><div><h2 className="font-black">{editing ? "Editar utilizador" : mode === "INVITE" ? "Convidar utilizador" : "Criar utilizador"}</h2><p className="text-xs text-slate-400">{mode === "INVITE" && !editing ? "Cria uma ligação segura para o colaborador definir a palavra-passe." : "Cria ou altera um acesso individual."}</p></div></div>
          {!editing && <div className="mt-5 grid grid-cols-2 rounded-xl bg-slate-100 p-1"><button onClick={() => { setMode("CREATE"); reset(); }} className={`rounded-lg px-3 py-2 text-xs font-black ${mode === "CREATE" ? "bg-white shadow" : "text-slate-500"}`}>Criar agora</button><button onClick={() => { setMode("INVITE"); reset(); setMode("INVITE"); }} className={`rounded-lg px-3 py-2 text-xs font-black ${mode === "INVITE" ? "bg-white shadow" : "text-slate-500"}`}>Enviar convite</button></div>}
          <form className="mt-6 space-y-4" onSubmit={submit}>
            {mode === "CREATE" && <AvatarPicker value={form.avatarUrl} name={form.name} onChange={(avatarUrl) => setForm({ ...form, avatarUrl })} compact disabled={save.isPending} />}
            {mode === "CREATE" && <Field label="Nome"><input className="field" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>}
            <Field label="Email"><input className="field" type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></Field>
            {mode === "CREATE" && <Field label={editing ? "Nova palavra-passe (opcional)" : "Palavra-passe inicial"}><input className="field" type="password" required={!editing} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></Field>}
            <Field label="Nível de acesso"><select className="field" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as UserRole })}>{roles.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}</select><p className="mt-2 text-xs leading-5 text-slate-400">{roles.find((role) => role.value === form.role)?.text}</p></Field>
            {mode === "CREATE" && <><Field label="Função"><input className="field" value={form.jobTitle} onChange={(event) => setForm({ ...form, jobTitle: event.target.value })} placeholder="Gestor de clientes" /></Field><Field label="Telefone"><input className="field" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></Field></>}
            <div><p className="mb-2 text-sm font-bold text-slate-700">Permissões adicionais</p><div className="space-y-2 rounded-2xl border border-slate-200 p-3">{PERMISSION_OPTIONS.map((option) => { const checked = form.permissions.includes(option.code); return <button type="button" key={option.code} onClick={() => togglePermission(option.code)} className="flex w-full items-start gap-3 rounded-xl p-2 text-left hover:bg-slate-50"><span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${checked ? "border-cyan-500 bg-cyan-500 text-white" : "border-slate-300"}`}>{checked && <Check size={14} />}</span><span className="text-xs font-semibold leading-5 text-slate-600">{option.label}</span></button>; })}</div></div>
            <div className="flex gap-2 pt-2"><button className="btn-primary flex-1 justify-center" disabled={save.isPending}>{save.isPending ? "A guardar…" : editing ? "Guardar alterações" : mode === "INVITE" ? "Criar convite" : "Criar acesso"}</button>{editing && <button type="button" className="btn-secondary" onClick={reset}>Cancelar</button>}</div>
          </form>
        </section>
      </div>
    </div>
  );
}

function UserAvatar({ user }: { user: TeamUser }) { const initials = user.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase(); return <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-900 text-sm font-black text-white">{user.avatarUrl ? <img src={user.avatarUrl} alt={`Fotografia de ${user.name}`} className="h-full w-full object-cover" /> : initials}</div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>{children}</label>; }
