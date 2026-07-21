"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, UserPlus } from "lucide-react";
import { api } from "@/services/api";
import { apiError } from "@/lib/api-error";

export default function AcceptInvitationPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => setToken(new URLSearchParams(window.location.search).get("token") || ""), []);

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(""); setLoading(true);
    try {
      await api.post("/auth/accept-invitation", { token, name: name.trim(), password });
      router.replace("/login?invitation=accepted");
    } catch (err) { setError(apiError(err, "Não foi possível aceitar o convite.")); }
    finally { setLoading(false); }
  }

  return <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#173b67_0,_#091a31_42%,_#040b15_100%)] px-5 py-10">
    <section className="w-full max-w-md rounded-[30px] border border-white/10 bg-white p-8 shadow-2xl">
      <div className="flex flex-col items-center text-center"><div className="rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-600 p-4 text-white"><UserPlus size={30} /></div><h1 className="mt-5 text-2xl font-black">Criar acesso individual</h1><p className="mt-2 text-sm leading-6 text-slate-500">Defina os seus dados para entrar no espaço privado da mediadora.</p></div>
      {!token ? <div className="mt-7 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">O convite não contém um código válido.</div> : <form className="mt-7 space-y-5" onSubmit={submit}>
        <Field label="Nome"><input className="field" required value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Palavra-passe"><input type="password" className="field" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
        {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</div>}
        <button className="btn-primary w-full justify-center" disabled={loading}><ShieldCheck size={17} /> {loading ? "A criar acesso…" : "Aceitar convite"}</button>
      </form>}
    </section>
  </main>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-sm font-bold text-slate-700">{label}<span className="mt-2 block">{children}</span></label>; }
