type PageTitleProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function PageTitle({ title, description, action }: PageTitleProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
