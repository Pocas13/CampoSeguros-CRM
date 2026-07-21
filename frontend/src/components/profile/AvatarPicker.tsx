"use client";

import { ChangeEvent, useRef, useState } from "react";
import { Camera, Trash2, Upload } from "lucide-react";

type AvatarPickerProps = {
  value: string;
  name: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  compact?: boolean;
};

const MAX_INPUT_BYTES = 4 * 1024 * 1024;
const OUTPUT_SIZE = 256;

export default function AvatarPicker({
  value,
  name,
  onChange,
  disabled = false,
  compact = false,
}: AvatarPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "IF";

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    setError("");

    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Selecione um ficheiro de imagem.");
      return;
    }
    if (file.size > MAX_INPUT_BYTES) {
      setError("A imagem deve ter no máximo 4 MB.");
      return;
    }

    try {
      const dataUrl = await resizeToWebp(file, OUTPUT_SIZE);
      onChange(dataUrl);
    } catch {
      setError("Não foi possível processar a fotografia.");
    }
  }

  return (
    <div className={compact ? "space-y-2" : "rounded-2xl border border-slate-200 bg-slate-50 p-4"}>
      <div className={`flex ${compact ? "items-center gap-3" : "flex-col items-center gap-4 sm:flex-row"}`}>
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-700 text-white shadow-lg">
          {value ? (
            <img src={value} alt={`Fotografia de ${name || "utilizador"}`} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xl font-black">{initials}</div>
          )}
          <span className="absolute bottom-1 right-1 rounded-lg bg-slate-950/80 p-1 text-white"><Camera size={13} /></span>
        </div>

        <div className={compact ? "min-w-0 flex-1" : "min-w-0 flex-1 text-center sm:text-left"}>
          {!compact && <><p className="font-black text-slate-900">Fotografia do utilizador</p><p className="mt-1 text-xs leading-5 text-slate-500">A imagem é recortada e comprimida automaticamente para 256 × 256 px.</p></>}
          <div className={`${compact ? "mt-0" : "mt-3"} flex flex-wrap ${compact ? "gap-2" : "justify-center gap-2 sm:justify-start"}`}>
            <button type="button" disabled={disabled} onClick={() => inputRef.current?.click()} className="btn-secondary text-xs">
              <Upload size={15} /> {value ? "Substituir" : "Carregar foto"}
            </button>
            {value && (
              <button type="button" disabled={disabled} onClick={() => onChange("")} className="rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 disabled:opacity-50">
                <Trash2 size={15} className="inline" /> Remover
              </button>
            )}
          </div>
        </div>
      </div>

      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFile} className="hidden" />
      {error && <p className="mt-2 text-xs font-semibold text-rose-600">{error}</p>}
    </div>
  );
}

function resizeToWebp(file: File, size: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("image"));
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext("2d");
        if (!context) return reject(new Error("canvas"));

        const sourceSize = Math.min(image.width, image.height);
        const sourceX = (image.width - sourceSize) / 2;
        const sourceY = (image.height - sourceSize) / 2;
        context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, size, size);
        resolve(canvas.toDataURL("image/webp", 0.82));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
