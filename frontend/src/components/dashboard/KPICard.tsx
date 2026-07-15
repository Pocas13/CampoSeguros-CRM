type KPICardProps = {
  title: string;
  value: string;
  description?: string;
};

export function KPICard({ title, value, description }: KPICardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h4 className="text-slate-500">{title}</h4>
      <p className="mt-4 text-4xl font-bold text-slate-800">{value}</p>
      {description ? <p className="mt-2 text-sm text-slate-400">{description}</p> : null}
    </div>
  );
}
