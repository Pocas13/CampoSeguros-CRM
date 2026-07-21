import { ShieldCheck } from "lucide-react";

export default function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 shadow-lg shadow-blue-950/30">
        <ShieldCheck className="h-6 w-6 text-white" strokeWidth={2.5} />
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-slate-950 bg-emerald-400" />
      </div>
      {!compact && (
        <div>
          <div className="text-xl font-black tracking-tight text-white">
            Insure<span className="text-cyan-300">Flow</span>
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Plataforma de mediação
          </div>
        </div>
      )}
    </div>
  );
}
