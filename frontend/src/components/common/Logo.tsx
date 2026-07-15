type LogoProps = {
  className?: string;
};

export function Logo({ className = "" }: LogoProps) {
  return (
    <div className={className}>
      <h1 className="text-3xl font-bold text-blue-400">InsureFlow</h1>
      <p className="mt-1 text-slate-400">CRM para Mediação de Seguros</p>
    </div>
  );
}
