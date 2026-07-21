"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  FileSearch,
  FileWarning,
  LoaderCircle,
  Search,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { globalSearch, type GlobalSearchItem } from "@/services/search";

const typeLabels: Record<GlobalSearchItem["type"], string> = {
  CLIENT: "Cliente",
  POLICY: "Apólice",
  CLAIM: "Sinistro",
  QUOTE: "Cotação",
};

function ResultIcon({ type }: { type: GlobalSearchItem["type"] }) {
  const className = "h-4 w-4";
  if (type === "CLIENT") return <UserRound className={className} />;
  if (type === "POLICY") return <ShieldCheck className={className} />;
  if (type === "CLAIM") return <FileWarning className={className} />;
  return <FileSearch className={className} />;
}

export default function GlobalSearch() {
  const router = useRouter();
  const desktopInput = useRef<HTMLInputElement>(null);
  const mobileInput = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query.trim()), 220);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function onShortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (window.matchMedia("(min-width: 1280px)").matches) {
          setOpen(true);
          window.setTimeout(() => desktopInput.current?.focus(), 0);
        } else {
          setMobileOpen(true);
          window.setTimeout(() => mobileInput.current?.focus(), 0);
        }
      }
      if (event.key === "Escape") {
        setOpen(false);
        setMobileOpen(false);
      }
    }
    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  }, []);

  const resultQuery = useQuery({
    queryKey: ["global-search", debounced],
    queryFn: () => globalSearch(debounced),
    enabled: debounced.length >= 2,
    staleTime: 15_000,
  });

  const results = useMemo(() => resultQuery.data?.results ?? [], [resultQuery.data]);

  useEffect(() => setSelectedIndex(0), [debounced]);

  function openResult(item: GlobalSearchItem) {
    setOpen(false);
    setMobileOpen(false);
    setQuery("");
    router.push(item.href);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!results.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((current) => (current + 1) % results.length);
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((current) => (current - 1 + results.length) % results.length);
    }
    if (event.key === "Enter") {
      event.preventDefault();
      openResult(results[selectedIndex]);
    }
  }

  const panel = (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/15">
      {query.trim().length < 2 ? (
        <div className="p-6 text-center text-sm text-slate-400">
          Escreva pelo menos 2 caracteres para procurar clientes, apólices, sinistros e cotações.
        </div>
      ) : resultQuery.isFetching ? (
        <div className="flex items-center justify-center gap-2 p-6 text-sm text-slate-500">
          <LoaderCircle className="h-4 w-4 animate-spin" /> A pesquisar…
        </div>
      ) : results.length ? (
        <div className="max-h-[420px] overflow-y-auto p-2">
          {results.map((item, index) => (
            <button
              key={`${item.type}-${item.id}`}
              type="button"
              onMouseEnter={() => setSelectedIndex(index)}
              onClick={() => openResult(item)}
              className={`flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition ${
                selectedIndex === index ? "bg-cyan-50" : "hover:bg-slate-50"
              }`}
            >
              <span className={`mt-0.5 rounded-lg p-2 ${selectedIndex === index ? "bg-cyan-100 text-cyan-700" : "bg-slate-100 text-slate-500"}`}>
                <ResultIcon type={item.type} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-sm font-black text-slate-800">{item.title}</span>
                  {item.badge && <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-black uppercase text-slate-500">{item.badge}</span>}
                </span>
                <span className="mt-1 block truncate text-xs text-slate-500">{item.subtitle}</span>
              </span>
              <span className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">{typeLabels[item.type]}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="p-7 text-center">
          <p className="text-sm font-bold text-slate-700">Sem resultados</p>
          <p className="mt-1 text-xs text-slate-400">Tente nome, NIF, email, número de apólice ou sinistro.</p>
        </div>
      )}
      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-2 text-[10px] text-slate-400">
        <span>↑ ↓ navegar · Enter abrir</span>
        <span>Pesquisa limitada à sua mediadora</span>
      </div>
    </div>
  );

  return (
    <>
      <div className="relative hidden max-w-xl flex-1 xl:block">
        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-400 focus-within:border-cyan-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-cyan-100/60">
          <Search size={17} />
          <input
            ref={desktopInput}
            value={query}
            onChange={(event) => { setQuery(event.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            className="ml-2 w-full bg-transparent text-sm text-slate-700 outline-none"
            placeholder="Pesquisar cliente, NIF, apólice, sinistro ou cotação…"
          />
          {query ? (
            <button type="button" onClick={() => setQuery("")} className="rounded p-1 hover:bg-slate-200" aria-label="Limpar pesquisa"><X size={14} /></button>
          ) : (
            <kbd className="rounded border bg-white px-1.5 py-0.5 text-[10px]">Ctrl K</kbd>
          )}
        </div>
        {open && (
          <>
            <button type="button" className="fixed inset-0 z-40 cursor-default" onClick={() => setOpen(false)} aria-label="Fechar pesquisa" />
            <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50">{panel}</div>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={() => { setMobileOpen(true); window.setTimeout(() => mobileInput.current?.focus(), 0); }}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 xl:hidden"
        aria-label="Pesquisar"
      >
        <Search size={18} />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/45 p-3 backdrop-blur-sm">
          <button type="button" className="absolute inset-0" onClick={() => setMobileOpen(false)} aria-label="Fechar pesquisa" />
          <div className="relative mx-auto mt-8 max-w-2xl">
            <div className="mb-2 flex items-center rounded-2xl bg-white p-3 shadow-xl">
              <Search className="text-slate-400" size={19} />
              <input
                ref={mobileInput}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={onKeyDown}
                className="ml-3 min-w-0 flex-1 bg-transparent text-base outline-none"
                placeholder="Pesquisar no InsureFlow…"
              />
              <button type="button" onClick={() => setMobileOpen(false)} className="rounded-xl p-2 hover:bg-slate-100"><X size={19} /></button>
            </div>
            {panel}
          </div>
        </div>
      )}
    </>
  );
}
