import Link from "next/link";
import {
  FileText,
  Receipt,
  Users,
  BarChart3,
  Settings,
  ArrowRight,
  TrendingUp,
  Building2,
} from "lucide-react";

const modules = [
  {
    href: "/reports",
    icon: BarChart3,
    title: "P&L Report",
    description: "Compare actuals vs budget across months with drill-down into individual account transactions.",
    color: "bg-emerald-50 text-emerald-700 border-emerald-100",
    iconBg: "bg-emerald-100",
  },
  {
    href: "/invoices",
    icon: FileText,
    title: "Invoices",
    description: "View all customer invoices, track statuses, amounts due and balances outstanding.",
    color: "bg-blue-50 text-blue-700 border-blue-100",
    iconBg: "bg-blue-100",
  },
  {
    href: "/bills",
    icon: Receipt,
    title: "Bills",
    description: "Monitor vendor bills, payment statuses, and outstanding payables.",
    color: "bg-amber-50 text-amber-700 border-amber-100",
    iconBg: "bg-amber-100",
  },
  {
    href: "/vendors",
    icon: Building2,
    title: "Vendors",
    description: "Browse your vendor directory with contact details and outstanding payable amounts.",
    color: "bg-purple-50 text-purple-700 border-purple-100",
    iconBg: "bg-purple-100",
  },
  {
    href: "/settings",
    icon: Settings,
    title: "Settings",
    description: "Configure budget defaults for Sales, COGS, and Net Profit used in the P&L comparison.",
    color: "bg-slate-50 text-slate-700 border-slate-100",
    iconBg: "bg-slate-100",
  },
];

export default function WelcomePage() {
  return (
    <section className="flex flex-col flex-1 p-7 md:p-10 min-w-0 min-h-full bg-[#f6f7f2]">
      {/* Hero */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-[#d8f275] text-[#173f35] text-xs font-bold uppercase tracking-wider">
          <TrendingUp size={13} />
          Zoho Books Integration
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#14213d] mb-3 leading-tight">
          Welcome to your<br />
          <span className="text-[#116149]">Finance Workspace</span>
        </h1>
        <p className="text-slate-500 text-base max-w-lg">
          A real-time dashboard connected to Zoho Books. Analyse your P&L,
          track invoices & bills, and manage vendor relationships — all in one place.
        </p>
      </div>

      {/* Module cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {modules.map(({ href, icon: Icon, title, description, color, iconBg }) => (
          <Link
            key={href}
            href={href}
            className={`group flex flex-col gap-4 p-6 rounded-xl border bg-white shadow-sm hover:shadow-md transition-all hover:-translate-y-[2px]`}
          >
            <div className="flex items-start justify-between">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}>
                <Icon size={20} className="text-[#173f35]" />
              </div>
              <ArrowRight
                size={16}
                className="text-slate-300 group-hover:text-[#116149] group-hover:translate-x-1 transition-all"
              />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#14213d] mb-1">{title}</h2>
              <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer note */}
      <p className="mt-10 text-xs text-slate-400">
        Connected to Zoho Books · Data refreshed on each page load
      </p>
    </section>
  );
}
