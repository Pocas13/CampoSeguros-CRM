"use client";

import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Car,
  Check,
  ExternalLink,
  HeartPulse,
  Home,
  Motorbike,
  Plane,
  ShieldPlus,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import { getClients, createClient } from "@/services/clients";
import { getInsurers } from "@/services/insurers";
import { createQuote } from "@/services/quotes";
import { apiError } from "@/lib/api-error";
import VehicleLookupPanel from "@/components/vehicles/VehicleLookupPanel";

const products = [
  { code: "AUTO", label: "Automóvel", text: "Ligeiros, comerciais e TVDE", icon: Car },
  { code: "MOTORCYCLE", label: "Moto", text: "Motos, scooters e ciclomotores", icon: Motorbike },
  { code: "HOME", label: "Habitação", text: "Multirriscos, recheio e condomínio", icon: Home },
  { code: "LIFE", label: "Vida", text: "Vida risco e crédito habitação", icon: ShieldPlus },
  { code: "HEALTH", label: "Saúde", text: "Individual, família e empresas", icon: HeartPulse },
  { code: "WORK_ACCIDENT", label: "Acidentes de Trabalho", text: "Conta própria e conta de outrem", icon: Users },
  { code: "BUSINESS", label: "Empresas", text: "Multirriscos, RC e equipamentos", icon: Building2 },
  { code: "TRAVEL", label: "Viagem", text: "Lazer, negócios e grupos", icon: Plane },
];

const blankClient = { name: "", nif: "", email: "", phone: "", city: "" };

export default function NewQuotePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [clientMode, setClientMode] = useState<"existing" | "new">("existing");
  const [clientId, setClientId] = useState("");
  const [newClient, setNewClient] = useState(blankClient);
  const [productType, setProductType] = useState("AUTO");
  const [title, setTitle] = useState("");
  const [effectiveDate, setEffectiveDate] = useState(new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
  const [risk, setRisk] = useState<Record<string, string | boolean>>({});
  const [preferences, setPreferences] = useState<Record<string, string | boolean>>({});
  const [selectedInsurers, setSelectedInsurers] = useState<number[]>([]);
  const [notes, setNotes] = useState("");
  const [stepError, setStepError] = useState("");

  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: getClients });
  const { data: insurers = [] } = useQuery({ queryKey: ["insurers"], queryFn: getInsurers });

  const selectedClient = clients.find((client) => client.id === Number(clientId));
  const product = products.find((item) => item.code === productType)!;

  const mutation = useMutation({
    mutationFn: async () => {
      let finalClientId = clientId ? Number(clientId) : null;
      if (clientMode === "new") {
        const created = await createClient({
          ...newClient,
          nif: newClient.nif || null,
          email: newClient.email || null,
          phone: newClient.phone || null,
          city: newClient.city || null,
        });
        finalClientId = created.id;
      }
      return createQuote({
        title: title.trim() || `${product.label} - ${clientMode === "existing" ? selectedClient?.name || "Novo processo" : newClient.name}`,
        productType,
        clientId: finalClientId,
        effectiveDate: effectiveDate || null,
        riskData: risk,
        preferences,
        insurerIds: selectedInsurers,
        notes: notes.trim() || null,
      });
    },
    onSuccess: (quote) => router.push(`/quotes/${quote.id}`),
  });

  function next() {
    setStepError("");
    if (step === 1 && clientMode === "existing" && !clientId) {
      setStepError("Selecione um cliente antes de continuar.");
      return;
    }
    if (step === 1 && clientMode === "new" && !newClient.name.trim()) {
      setStepError("Indique o nome do novo cliente.");
      return;
    }
    if (step === 3 && (productType === "AUTO" || productType === "MOTORCYCLE")) {
      const registration = String(risk.registration || "").replace(/[^A-Z0-9]/gi, "");
      if (registration.length !== 6) {
        setStepError("Indique uma matrícula válida para continuar.");
        return;
      }
    }
    setStep((current) => Math.min(4, current + 1));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    setStepError("");
    if (selectedInsurers.length === 0) {
      setStepError("Selecione pelo menos uma companhia para criar a cotação.");
      return;
    }
    mutation.mutate();
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Novo processo comercial</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight">Criar cotação</h1>
          <p className="mt-2 text-sm text-slate-500">Um único questionário para organizar propostas de várias companhias.</p>
        </div>
        <button type="button" onClick={() => router.push("/quotes")} className="btn-secondary"><ArrowLeft size={17}/> Voltar</button>
      </div>

      <div className="panel p-4 md:p-5">
        <div className="grid grid-cols-4 gap-2">
          {["Cliente", "Produto", "Risco", "Companhias"].map((label, index) => {
            const number = index + 1;
            const done = step > number;
            const active = step === number;
            return <button key={label} type="button" onClick={() => number < step && setStep(number)} className="relative flex flex-col items-center gap-2 p-2 text-center">
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black ${done ? "bg-emerald-500 text-white" : active ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg" : "bg-slate-100 text-slate-400"}`}>{done ? <Check size={17}/> : number}</span>
              <span className={`text-xs font-bold ${active ? "text-slate-900" : "text-slate-400"}`}>{label}</span>
              {index < 3 && <span className={`absolute left-[62%] top-[25px] hidden h-0.5 w-[76%] md:block ${done ? "bg-emerald-300" : "bg-slate-100"}`}/>} 
            </button>;
          })}
        </div>
      </div>

      {step === 1 && (
        <section className="panel p-6">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="eyebrow">Passo 1</p><h2 className="mt-1 text-xl font-black">Quem pretende segurar?</h2></div><div className="flex rounded-xl bg-slate-100 p-1"><button type="button" onClick={() => setClientMode("existing")} className={`rounded-lg px-4 py-2 text-sm font-bold ${clientMode === "existing" ? "bg-white text-slate-900 shadow" : "text-slate-500"}`}>Cliente existente</button><button type="button" onClick={() => setClientMode("new")} className={`rounded-lg px-4 py-2 text-sm font-bold ${clientMode === "new" ? "bg-white text-slate-900 shadow" : "text-slate-500"}`}>Novo cliente</button></div></div>
          {clientMode === "existing" ? <div className="mt-6"><label className="text-sm font-bold text-slate-700">Selecionar cliente</label><select value={clientId} onChange={(e)=>setClientId(e.target.value)} className="field mt-2"><option value="">Escolher cliente…</option>{clients.map((client)=><option key={client.id} value={client.id}>{client.name} {client.nif ? `· ${client.nif}` : ""}</option>)}</select>{selectedClient && <div className="mt-4 flex items-center gap-4 rounded-2xl bg-cyan-50 p-4"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-600 font-black text-white">{selectedClient.name.slice(0,2).toUpperCase()}</div><div><p className="font-black text-slate-900">{selectedClient.name}</p><p className="text-sm text-slate-500">{selectedClient.email || "Sem email"} · {selectedClient.phone || "Sem telefone"}</p></div></div>}</div> : <div className="mt-6 grid gap-4 md:grid-cols-2"><div className="md:col-span-2"><label className="text-sm font-bold">Nome / denominação social *</label><input className="field mt-2" value={newClient.name} onChange={(e)=>setNewClient({...newClient,name:e.target.value})}/></div><Field label="NIF"><input className="field" maxLength={9} value={newClient.nif} onChange={(e)=>setNewClient({...newClient,nif:e.target.value.replace(/\D/g,"")})}/></Field><Field label="Telefone"><input className="field" value={newClient.phone} onChange={(e)=>setNewClient({...newClient,phone:e.target.value})}/></Field><Field label="Email"><input type="email" className="field" value={newClient.email} onChange={(e)=>setNewClient({...newClient,email:e.target.value})}/></Field><Field label="Localidade"><input className="field" value={newClient.city} onChange={(e)=>setNewClient({...newClient,city:e.target.value})}/></Field><div className="md:col-span-2 rounded-xl border border-dashed border-cyan-300 bg-cyan-50 p-4 text-sm text-cyan-800"><UserPlus className="mr-2 inline" size={17}/> O cliente será criado automaticamente e ficará disponível na carteira.</div></div>}
        </section>
      )}

      {step === 2 && (
        <section className="panel p-6">
          <p className="eyebrow">Passo 2</p><h2 className="mt-1 text-xl font-black">Qual é o produto?</h2><p className="mt-1 text-sm text-slate-500">O questionário adapta-se ao ramo escolhido.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{products.map((item)=>{const Icon=item.icon;const active=item.code===productType;return <button key={item.code} type="button" onClick={()=>setProductType(item.code)} className={`rounded-2xl border p-4 text-left transition ${active ? "border-cyan-400 bg-cyan-50 ring-4 ring-cyan-500/10" : "border-slate-200 hover:border-cyan-200 hover:bg-slate-50"}`}><div className={`flex h-11 w-11 items-center justify-center rounded-xl ${active ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-500"}`}><Icon size={21}/></div><p className="mt-3 font-black">{item.label}</p><p className="mt-1 text-xs leading-5 text-slate-500">{item.text}</p></button>})}</div>
          <div className="mt-6 grid gap-4 md:grid-cols-2"><Field label="Título da cotação"><input className="field" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder={`${product.label} - ${selectedClient?.name || newClient.name || "Cliente"}`}/></Field><Field label="Data pretendida de início"><input type="date" className="field" value={effectiveDate} onChange={(e)=>setEffectiveDate(e.target.value)}/></Field></div>
        </section>
      )}

      {step === 3 && (
        <section className="panel p-6">
          <p className="eyebrow">Passo 3</p><h2 className="mt-1 text-xl font-black">Dados do risco — {product.label}</h2><p className="mt-1 text-sm text-slate-500">Preencha os dados disponíveis. Pode completar ou corrigir mais tarde.</p>
          <div className="mt-6"><RiskFields productType={productType} risk={risk} setRisk={setRisk} preferences={preferences} setPreferences={setPreferences}/></div>
          <div className="mt-5"><Field label="Observações para as companhias"><textarea rows={4} className="field resize-none" value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder="Histórico relevante, condições pretendidas, informação adicional…"/></Field></div>
        </section>
      )}

      {step === 4 && (
        <section className="panel p-6">
          <p className="eyebrow">Passo 4</p><h2 className="mt-1 text-xl font-black">Companhias a consultar</h2><p className="mt-1 text-sm text-slate-500">São criadas linhas de proposta para acompanhar cada resposta.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{insurers.filter((item)=>item.active).map((insurer)=>{const active=selectedInsurers.includes(insurer.id);const hasSimulator=Boolean(insurer.quoteLinks?.[productType]);return <button type="button" key={insurer.id} onClick={()=>setSelectedInsurers(active ? selectedInsurers.filter((id)=>id!==insurer.id) : [...selectedInsurers,insurer.id])} className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${active ? "border-cyan-400 bg-cyan-50 ring-4 ring-cyan-500/10" : "border-slate-200 hover:bg-slate-50"}`}><div className={`flex h-11 w-11 items-center justify-center rounded-xl text-sm font-black ${active ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-500"}`}>{(insurer.commercialName||insurer.name).slice(0,2).toUpperCase()}</div><div className="min-w-0 flex-1"><p className="truncate font-black">{insurer.commercialName||insurer.name}</p><p className={`text-xs ${hasSimulator?"font-bold text-emerald-600":"text-slate-400"}`}>{hasSimulator?"Simulador online disponível":insurer.website||"Contacto por configurar"}</p></div>{active&&<Check className="text-cyan-600" size={19}/>}</button>})}</div>
          {selectedInsurers.some((id)=>insurers.find((item)=>item.id===id)?.quoteLinks?.[productType])&&<div className="mt-5 rounded-2xl border border-cyan-200 bg-cyan-50 p-5"><p className="text-sm font-black text-cyan-900">Simuladores oficiais disponíveis</p><p className="mt-1 text-xs text-cyan-700">Abra o simulador da companhia e mantenha esta cotação aberta para copiar os dados do risco.</p><div className="mt-3 flex flex-wrap gap-2">{selectedInsurers.map((id)=>insurers.find((item)=>item.id===id)).filter(Boolean).map((insurer:any)=>insurer.quoteLinks?.[productType]?<a key={insurer.id} href={insurer.quoteLinks[productType]} target="_blank" rel="noreferrer" className="btn-secondary bg-white"><ExternalLink size={16}/>{insurer.commercialName||insurer.name}</a>:null)}</div></div>}
          <div className="mt-6 grid gap-4 rounded-2xl bg-slate-950 p-5 text-white md:grid-cols-4"><Summary label="Cliente" value={clientMode==="existing" ? selectedClient?.name || "-" : newClient.name}/><Summary label="Produto" value={product.label}/><Summary label="Companhias" value={String(selectedInsurers.length)}/><Summary label="Início" value={effectiveDate ? new Date(`${effectiveDate}T12:00:00`).toLocaleDateString("pt-PT") : "-"}/></div>
        </section>
      )}

      {stepError && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">{stepError}</div>}
      {mutation.isError && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm font-semibold text-rose-700">{apiError(mutation.error, "Não foi possível criar a cotação.")}</div>}
      <div className="flex items-center justify-between"><button type="button" disabled={step===1} onClick={()=>setStep((s)=>Math.max(1,s-1))} className="btn-secondary disabled:invisible"><ArrowLeft size={17}/> Anterior</button>{step<4 ? <button type="button" onClick={next} className="btn-primary">Continuar <ArrowRight size={17}/></button> : <button type="submit" disabled={mutation.isPending} className="btn-primary"><Sparkles size={17}/>{mutation.isPending ? "A criar…" : "Criar e comparar"}</button>}</div>
    </form>
  );
}

function Field({label,children}:{label:string;children:React.ReactNode}){return <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>{children}</label>}
function Summary({label,value}:{label:string;value:string}){return <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 truncate font-black">{value}</p></div>}

function RiskFields({productType,risk,setRisk,preferences,setPreferences}:{productType:string;risk:Record<string,string|boolean>;setRisk:(v:Record<string,string|boolean>)=>void;preferences:Record<string,string|boolean>;setPreferences:(v:Record<string,string|boolean>)=>void}){
  const set=(key:string,value:string|boolean)=>setRisk({...risk,[key]:value});
  const pref=(key:string,value:string|boolean)=>setPreferences({...preferences,[key]:value});
  if (productType === "AUTO" || productType === "MOTORCYCLE") {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <VehicleLookupPanel
          vehicleType={productType}
          risk={risk}
          setRisk={setRisk}
        />
        <Field label="Marca"><input className="field" value={String(risk.brand || "")} onChange={(event) => set("brand", event.target.value)} /></Field>
        <Field label="Modelo"><input className="field" value={String(risk.model || "")} onChange={(event) => set("model", event.target.value)} /></Field>
        <Field label="Versão"><input className="field" value={String(risk.version || "")} onChange={(event) => set("version", event.target.value)} /></Field>
        <Field label="Ano"><input className="field" inputMode="numeric" value={String(risk.year || "")} onChange={(event) => set("year", event.target.value.replace(/\D/g, ""))} /></Field>
        <Field label="Combustível"><input className="field" value={String(risk.fuelType || "")} onChange={(event) => set("fuelType", event.target.value)} placeholder="Gasolina, Gasóleo, Elétrico…" /></Field>
        <Field label="Carroçaria"><input className="field" value={String(risk.bodyType || "")} onChange={(event) => set("bodyType", event.target.value)} /></Field>
        <Field label="Cilindrada (cc)"><input className="field" inputMode="numeric" value={String(risk.engineCapacityCc || "")} onChange={(event) => set("engineCapacityCc", event.target.value.replace(/\D/g, ""))} /></Field>
        <Field label="Potência (cv)"><input className="field" inputMode="numeric" value={String(risk.powerHp || "")} onChange={(event) => set("powerHp", event.target.value.replace(/\D/g, ""))} /></Field>
        <Field label="Caixa"><select className="field" value={String(risk.transmission || "")} onChange={(event) => set("transmission", event.target.value)}><option value="">Selecionar</option><option>Manual</option><option>Automática</option><option>Semiautomática</option></select></Field>
        <Field label="Utilização"><select className="field" value={String(risk.usage || "Particular")} onChange={(event) => set("usage", event.target.value)}><option>Particular</option><option>Profissional</option><option>TVDE</option><option>Comercial</option></select></Field>
        <Field label="Km por ano"><input className="field" inputMode="numeric" value={String(risk.annualKm || "")} onChange={(event) => set("annualKm", event.target.value.replace(/\D/g, ""))} /></Field>
        <Field label="Condutor principal"><input className="field" value={String(risk.mainDriver || "")} onChange={(event) => set("mainDriver", event.target.value)} /></Field>
        <Field label="Data da carta"><input type="date" className="field" value={String(risk.licenseDate || "")} onChange={(event) => set("licenseDate", event.target.value)} /></Field>
        <Field label="Sinistros últimos 5 anos"><input className="field" value={String(risk.claimsLast5Years || "")} onChange={(event) => set("claimsLast5Years", event.target.value)} /></Field>
        <CheckField label="Danos próprios" checked={Boolean(preferences.ownDamage)} onChange={(value) => pref("ownDamage", value)} />
        <CheckField label="Viatura de substituição" checked={Boolean(preferences.replacementVehicle)} onChange={(value) => pref("replacementVehicle", value)} />
        <CheckField label="Quebra de vidros" checked={Boolean(preferences.glass)} onChange={(value) => pref("glass", value)} />
      </div>
    );
  }
  if(productType==="HOME") return <div className="grid gap-4 md:grid-cols-3"><Field label="Tipo de imóvel"><select className="field" value={String(risk.propertyType||"Apartamento")} onChange={(e)=>set("propertyType",e.target.value)}><option>Apartamento</option><option>Moradia</option><option>Edifício</option><option>Loja</option></select></Field><Field label="Ano construção"><input className="field" value={String(risk.constructionYear||"")} onChange={(e)=>set("constructionYear",e.target.value)}/></Field><Field label="Área (m²)"><input className="field" value={String(risk.area||"")} onChange={(e)=>set("area",e.target.value)}/></Field><Field label="Capital edifício"><input className="field" value={String(risk.buildingCapital||"")} onChange={(e)=>set("buildingCapital",e.target.value)}/></Field><Field label="Capital recheio"><input className="field" value={String(risk.contentsCapital||"")} onChange={(e)=>set("contentsCapital",e.target.value)}/></Field><Field label="Utilização"><select className="field" value={String(risk.use||"Habitação própria permanente")} onChange={(e)=>set("use",e.target.value)}><option>Habitação própria permanente</option><option>Arrendamento</option><option>Alojamento local</option><option>Casa de férias</option></select></Field><CheckField label="Risco sísmico" checked={Boolean(preferences.seismicRisk)} onChange={(v)=>pref("seismicRisk",v)}/><CheckField label="Danos por água" checked={Boolean(preferences.waterDamage)} onChange={(v)=>pref("waterDamage",v)}/><CheckField label="Responsabilidade civil familiar" checked={Boolean(preferences.familyLiability)} onChange={(v)=>pref("familyLiability",v)}/></div>;
  if(productType==="LIFE") return <div className="grid gap-4 md:grid-cols-3"><Field label="Capital seguro"><input className="field" value={String(risk.capital||"")} onChange={(e)=>set("capital",e.target.value)}/></Field><Field label="Prazo (anos)"><input className="field" value={String(risk.term||"")} onChange={(e)=>set("term",e.target.value)}/></Field><Field label="Profissão"><input className="field" value={String(risk.profession||"")} onChange={(e)=>set("profession",e.target.value)}/></Field><Field label="Fumador"><select className="field" value={String(risk.smoker||"Não")} onChange={(e)=>set("smoker",e.target.value)}><option>Não</option><option>Sim</option></select></Field><Field label="Crédito associado"><select className="field" value={String(risk.mortgage||"Sim")} onChange={(e)=>set("mortgage",e.target.value)}><option>Sim</option><option>Não</option></select></Field><Field label="Entidade bancária"><input className="field" value={String(risk.bank||"")} onChange={(e)=>set("bank",e.target.value)}/></Field></div>;
  if(productType==="HEALTH") return <div className="grid gap-4 md:grid-cols-3"><Field label="Pessoas seguras"><input className="field" value={String(risk.insuredPersons||"")} onChange={(e)=>set("insuredPersons",e.target.value)}/></Field><Field label="Idades"><input className="field" value={String(risk.ages||"")} onChange={(e)=>set("ages",e.target.value)} placeholder="38, 49, 12"/></Field><Field label="Rede preferida"><input className="field" value={String(risk.network||"")} onChange={(e)=>set("network",e.target.value)}/></Field><CheckField label="Hospitalização" checked={Boolean(preferences.hospitalization)} onChange={(v)=>pref("hospitalization",v)}/><CheckField label="Ambulatório" checked={Boolean(preferences.outpatient)} onChange={(v)=>pref("outpatient",v)}/><CheckField label="Estomatologia" checked={Boolean(preferences.dental)} onChange={(v)=>pref("dental",v)}/></div>;
  if(productType==="WORK_ACCIDENT") return <div className="grid gap-4 md:grid-cols-3"><Field label="Atividade / profissão"><input className="field" value={String(risk.activity||"")} onChange={(e)=>set("activity",e.target.value)}/></Field><Field label="CAE"><input className="field" value={String(risk.cae||"")} onChange={(e)=>set("cae",e.target.value)}/></Field><Field label="N.º trabalhadores"><input className="field" value={String(risk.employees||"")} onChange={(e)=>set("employees",e.target.value)}/></Field><Field label="Massa salarial anual"><input className="field" value={String(risk.annualPayroll||"")} onChange={(e)=>set("annualPayroll",e.target.value)}/></Field><Field label="Trabalho no estrangeiro"><select className="field" value={String(risk.foreignWork||"Não")} onChange={(e)=>set("foreignWork",e.target.value)}><option>Não</option><option>Sim</option></select></Field><Field label="Histórico de sinistros"><input className="field" value={String(risk.claimsHistory||"")} onChange={(e)=>set("claimsHistory",e.target.value)}/></Field></div>;
  if(productType==="TRAVEL") return <div className="grid gap-4 md:grid-cols-3"><Field label="Destino"><input className="field" value={String(risk.destination||"")} onChange={(e)=>set("destination",e.target.value)}/></Field><Field label="Data de partida"><input type="date" className="field" value={String(risk.departureDate||"")} onChange={(e)=>set("departureDate",e.target.value)}/></Field><Field label="Data de regresso"><input type="date" className="field" value={String(risk.returnDate||"")} onChange={(e)=>set("returnDate",e.target.value)}/></Field><Field label="Viajantes"><input className="field" value={String(risk.travelers||"")} onChange={(e)=>set("travelers",e.target.value)}/></Field><Field label="Motivo"><select className="field" value={String(risk.purpose||"Lazer")} onChange={(e)=>set("purpose",e.target.value)}><option>Lazer</option><option>Negócios</option><option>Estudos</option></select></Field><CheckField label="Desportos de risco" checked={Boolean(preferences.sports)} onChange={(v)=>pref("sports",v)}/></div>;
  return <div className="grid gap-4 md:grid-cols-3"><Field label="Atividade"><input className="field" value={String(risk.activity||"")} onChange={(e)=>set("activity",e.target.value)}/></Field><Field label="Faturação anual"><input className="field" value={String(risk.turnover||"")} onChange={(e)=>set("turnover",e.target.value)}/></Field><Field label="N.º colaboradores"><input className="field" value={String(risk.employees||"")} onChange={(e)=>set("employees",e.target.value)}/></Field><Field label="Capital de instalações"><input className="field" value={String(risk.premisesValue||"")} onChange={(e)=>set("premisesValue",e.target.value)}/></Field><Field label="Capital de conteúdos"><input className="field" value={String(risk.contentsValue||"")} onChange={(e)=>set("contentsValue",e.target.value)}/></Field><Field label="Responsabilidade civil"><input className="field" value={String(risk.liabilityCapital||"")} onChange={(e)=>set("liabilityCapital",e.target.value)}/></Field></div>;
}
function CheckField({label,checked,onChange}:{label:string;checked:boolean;onChange:(v:boolean)=>void}){return <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${checked?"border-cyan-300 bg-cyan-50":"border-slate-200"}`}><input type="checkbox" checked={checked} onChange={(e)=>onChange(e.target.checked)} className="h-4 w-4 accent-cyan-600"/><span className="text-sm font-bold text-slate-700">{label}</span></label>}
