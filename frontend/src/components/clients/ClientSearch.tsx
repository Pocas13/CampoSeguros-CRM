"use client";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function ClientSearch({ value, onChange }: Props) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Pesquisar cliente..."
      className="mb-6 w-full rounded-lg border bg-white p-3"
    />
  );
}