"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { apiError } from "@/lib/api-error";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);
  const [invitationAccepted, setInvitationAccepted] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSessionExpired(params.get("session") === "expired");
    setInvitationAccepted(params.get("invitation") === "accepted");
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const authenticatedUser = await login(email.trim(), password);

      const params = new URLSearchParams(window.location.search);
      const requestedPath = params.get("next");
      const destination =
        requestedPath?.startsWith("/") && !requestedPath.startsWith("//")
          ? requestedPath
          : authenticatedUser.role === "SUPER_ADMIN"
            ? "/platform/organizations"
            : "/dashboard";

      router.replace(destination);
      router.refresh();
    } catch (err) {
      setError(apiError(err, "Não foi possível iniciar sessão."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_#173b67_0,_#091a31_42%,_#040b15_100%)] px-5 py-10">
      <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />

      <section className="relative w-full max-w-md rounded-[30px] border border-white/10 bg-white p-7 shadow-2xl shadow-black/30 sm:p-9">
        <div className="flex flex-col items-center text-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 shadow-xl shadow-blue-500/25">
            <ShieldCheck className="h-8 w-8 text-white" strokeWidth={2.4} />
            <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-400" />
          </div>

          <p className="mt-5 text-2xl font-black tracking-tight text-slate-950">
            Insure<span className="text-cyan-600">Flow</span>
          </p>
          <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
            <LockKeyhole size={13} /> Acesso privado
          </div>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm font-bold text-slate-700">
            Email
            <input
              className="field mt-2"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="username"
              autoFocus
              placeholder="nome@empresa.pt"
            />
          </label>

          <label className="block text-sm font-bold text-slate-700">
            Palavra-passe
            <input
              className="field mt-2"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </label>

          {invitationAccepted && !error && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
              Acesso criado. Já pode iniciar sessão.
            </div>
          )}

          {sessionExpired && !error && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-800">
              A sua sessão terminou. Inicie sessão novamente.
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
              {error}
            </div>
          )}

          <button
            className="btn-primary w-full justify-center py-3"
            disabled={loading}
          >
            {loading ? "A validar acesso…" : "Entrar"}
          </button>
        </form>

        <p className="mt-7 text-center text-[11px] leading-5 text-slate-400">
          Área reservada a utilizadores autorizados.
        </p>
      </section>
    </main>
  );
}
