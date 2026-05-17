import { cookies } from "next/headers";
import { CheckCircle2, XCircle } from "lucide-react";
import budget from "../../data/budget.json";
import BudgetForm from "./BudgetForm";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const isConnected = cookieStore.has("zoho_access_token");

  return (
    <section className="flex flex-col flex-1 p-5 md:p-7 overflow-x-auto min-w-0">
      <header className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <p className="m-[0_0_5px] text-slate-500 text-xs font-extrabold uppercase tracking-normal">
            CONFIGURATION
          </p>
          <h2 className="m-0 text-[#14213d] text-2xl font-bold">
            Integration Settings
          </h2>
        </div>
      </header>

      <div className="mt-8 max-w-2xl bg-white rounded-xl border border-[#d9dfd1] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[#e4e8dd]">
          <h3 className="text-lg font-bold text-[#14213d] mb-2">
            Zoho Books Connection
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            Connect your Zoho account to enable live data syncing for your
            Profit & Loss reports.
          </p>

          <div className="flex items-center justify-between p-4 bg-[#f8faf6] rounded-lg border border-[#e4e8dd]">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${isConnected ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
              >
                {isConnected ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <XCircle size={20} />
                )}
              </div>
              <div>
                <p className="font-bold text-[#14213d]">
                  {isConnected ? "Connected to Zoho" : "Not Connected"}
                </p>
                <p className="text-xs text-slate-500">
                  {isConnected
                    ? "Connected as: Test Company"
                    : "Requires authorization"}
                </p>
              </div>
            </div>

            <a
              href="/api/auth/zoho"
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${isConnected ? "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50" : "bg-[#173f35] text-white hover:bg-[#113028]"}`}
            >
              {isConnected ? "Reconnect" : "Connect to Zoho"}
            </a>
          </div>
        </div>

        <BudgetForm initialBudget={budget} />
      </div>
    </section>
  );
}
