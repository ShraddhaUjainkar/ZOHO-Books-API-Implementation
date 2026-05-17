interface PageHeaderProps {
  label?: string;
  title: string;
}

export function PageHeader({ label = "ZOHO BOOKS", title }: PageHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
      <div>
        <p className="m-[0_0_5px] text-slate-500 text-xs font-extrabold uppercase tracking-normal">
          {label}
        </p>
        <h2 className="m-0 text-[#14213d] text-2xl font-bold">{title}</h2>
      </div>
    </header>
  );
}
