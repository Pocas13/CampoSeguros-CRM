"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { CalendarDays, CarFront, CheckCircle2, ChevronDown, ChevronUp, Search, ShieldCheck } from "lucide-react";
import { apiError } from "@/lib/api-error";
import { lookupVehicle, type VehicleCandidate } from "@/services/vehicle-lookup";

type RiskValue = string | boolean;
type RiskData = Record<string, RiskValue>;

type VehicleLookupPanelProps = {
  vehicleType: "AUTO" | "MOTORCYCLE";
  risk: RiskData;
  setRisk: (value: RiskData) => void;
};

export default function VehicleLookupPanel({ vehicleType, risk, setRisk }: VehicleLookupPanelProps) {
  const [showAdditional, setShowAdditional] = useState(Boolean(risk.vin));
  const [selectedId, setSelectedId] = useState("");
  const mutation = useMutation({
    mutationFn: () => lookupVehicle({
      registrationNumber: String(risk.registration || ""),
      firstRegistrationDate: String(risk.firstRegistrationDate || "") || null,
      vin: String(risk.vin || "") || null,
      vehicleType,
    }),
    onSuccess: (result) => {
      if (result.candidates.length === 1) applyCandidate(result.candidates[0]);
    },
  });

  const set = (key: string, value: RiskValue) => setRisk({ ...risk, [key]: value });

  function applyCandidate(candidate: VehicleCandidate) {
    setSelectedId(candidate.id);
    setRisk({
      ...risk,
      registration: candidate.registrationNumber,
      firstRegistrationDate: candidate.firstRegistrationDate || String(risk.firstRegistrationDate || ""),
      brand: candidate.make,
      model: candidate.model,
      version: candidate.version || "",
      year: candidate.year ? String(candidate.year) : "",
      fuelType: candidate.fuelType || "",
      bodyType: candidate.bodyType || "",
      engineCapacityCc: candidate.engineCapacityCc ? String(candidate.engineCapacityCc) : "",
      powerKw: candidate.powerKw ? String(candidate.powerKw) : "",
      powerHp: candidate.powerHp ? String(candidate.powerHp) : "",
      transmission: candidate.transmission || "",
      seats: candidate.seats ? String(candidate.seats) : "",
      vin: candidate.vin || String(risk.vin || ""),
      vehicleLookupSource: mutation.data?.source || "DEMO",
      vehicleLookupConfirmed: true,
    });
  }

  return (
    <div className="md:col-span-3 space-y-4 rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-cyan-600 p-2.5 text-white"><CarFront size={20} /></div>
          <div><p className="font-black text-slate-900">Identificação do veículo</p><p className="mt-1 text-xs leading-5 text-slate-600">Use a matrícula como dado principal. A data da primeira matrícula só é necessária quando existirem várias versões possíveis.</p></div>
        </div>
        {Boolean(risk.vehicleLookupConfirmed) && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700"><CheckCircle2 size={14} /> Confirmado</span>}
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
        <Field label="Matrícula *">
          <input className="field uppercase" required value={String(risk.registration || "")} onChange={(event) => set("registration", formatRegistration(event.target.value))} placeholder="AA-00-AA" />
        </Field>
        <Field label="Data da primeira matrícula">
          <div className="relative"><CalendarDays className="pointer-events-none absolute left-3 top-3.5 text-slate-400" size={17} /><input type="date" className="field pl-10" value={String(risk.firstRegistrationDate || "")} onChange={(event) => set("firstRegistrationDate", event.target.value)} /></div>
        </Field>
        <div className="flex items-end"><button type="button" disabled={mutation.isPending || String(risk.registration || "").replace(/[^A-Z0-9]/gi, "").length !== 6} onClick={() => mutation.mutate()} className="btn-primary h-[46px] w-full justify-center md:w-auto"><Search size={17} />{mutation.isPending ? "A consultar…" : "Identificar"}</button></div>
      </div>

      <button type="button" onClick={() => setShowAdditional((value) => !value)} className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900">
        {showAdditional ? <ChevronUp size={15} /> : <ChevronDown size={15} />} Dados adicionais opcionais
      </button>
      {showAdditional && (
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="VIN (opcional)"><input className="field uppercase" maxLength={17} value={String(risk.vin || "")} onChange={(event) => set("vin", event.target.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, ""))} placeholder="17 caracteres" /></Field>
          <div className="flex items-end"><p className="rounded-xl bg-white/70 p-3 text-xs leading-5 text-slate-500">O VIN nunca bloqueia a simulação. Serve apenas para casos excecionais, importados ou versões difíceis de distinguir.</p></div>
        </div>
      )}

      {mutation.isError && <div className="rounded-xl border border-rose-200 bg-white p-4 text-sm font-semibold text-rose-700">{apiError(mutation.error, "Não foi possível consultar o veículo.")}</div>}
      {mutation.data && (
        <div className={`rounded-xl border p-4 ${mutation.data.status === "NOT_FOUND" ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-white"}`}>
          <div className="flex items-start gap-3"><ShieldCheck className={mutation.data.status === "NOT_FOUND" ? "text-amber-600" : "text-emerald-600"} size={19} /><div className="min-w-0 flex-1"><p className="text-sm font-black text-slate-900">{mutation.data.status === "NOT_FOUND" ? "Preenchimento manual" : "Resultado da consulta"}</p><p className="mt-1 text-xs leading-5 text-slate-600">{mutation.data.message}</p></div></div>
          {mutation.data.candidates.length > 0 && (
            <div className="mt-4 grid gap-3">
              {mutation.data.candidates.map((candidate) => (
                <button type="button" key={candidate.id} onClick={() => applyCandidate(candidate)} className={`rounded-xl border p-4 text-left transition ${selectedId === candidate.id ? "border-cyan-500 bg-cyan-50 ring-4 ring-cyan-500/10" : "border-slate-200 bg-white hover:border-cyan-300"}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2"><p className="font-black">{candidate.make} {candidate.model}</p><span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-500">{candidate.confidence === "HIGH" ? "ALTA CONFIANÇA" : "CONFIRMAR"}</span></div>
                  <p className="mt-1 text-sm text-slate-600">{candidate.version || "Versão por confirmar"}</p>
                  <p className="mt-2 text-xs text-slate-400">{[candidate.firstRegistrationDate, candidate.fuelType, candidate.powerHp ? `${candidate.powerHp} cv` : null, candidate.engineCapacityCc ? `${candidate.engineCapacityCc} cc` : null].filter(Boolean).join(" · ")}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>{children}</label>;
}

function formatRegistration(value: string) {
  const compact = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
  return [compact.slice(0, 2), compact.slice(2, 4), compact.slice(4, 6)].filter(Boolean).join("-");
}
