"use client";

import React, { useState, useEffect } from "react";
import { getActuals } from "@/src/actions/actuals";
import { PageHeader } from "@/src/components/PageHeader";

type ReportRow = {
  id: string;
  label: string;
  group: string | null;
  type: string;
  account_id: string | null;
  may: number;
  mayBudget: number;
  april: number;
  aprilBudget: number;
};

function formatCurrency(value: number) {
  // Return negative values with minus sign or handled cleanly
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    value,
  );
}

const ReportsPage = () => {
  const [actualRows, setActualRows] = useState<ReportRow[]>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchActuals() {
      setLoading(true);
      try {
        const data = await getActuals();
        if (data && Array.isArray(data)) {
          setActualRows(data);
        }
      } catch (err) {
        console.error("Failed to fetch actuals:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchActuals();
  }, []);

  const handleAccountClick = (rowId: string, accountId: string, month: string) => {
    const params = new URLSearchParams({ aid: btoa(accountId), month });
    window.location.href = `/reports/${rowId}?${params}`;
  };

  const netProfitRow = actualRows?.find((row) => row.id === "net-profit");
  const netProfitMayActual = netProfitRow?.may || 0;
  const netProfitAprilActual = netProfitRow?.april || 0;

  return (
    <>
      <section className="flex flex-col flex-1 p-5 md:p-8 overflow-x-auto min-w-0 bg-slate-50/50">
        <PageHeader title="P&L comparison" />

        {/* Diagnostic KPI summary at top */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 my-6 p-5 border border-[#d9dfd1] rounded-lg bg-white shadow-sm">
          <div className="grid gap-1">
            <span className="text-slate-500 text-[13px] font-medium">May Net Profit</span>
            <strong className="text-[#173f35] text-2xl font-extrabold tracking-tight">
              {loading ? "..." : formatCurrency(netProfitMayActual)}
            </strong>
          </div>
          <div className="grid gap-1">
            <span className="text-slate-500 text-[13px] font-medium">April Net Profit</span>
            <strong className="text-[#173f35] text-2xl font-extrabold tracking-tight">
              {loading ? "..." : formatCurrency(netProfitAprilActual)}
            </strong>
          </div>
          <div className="grid gap-1">
            <span className="text-slate-500 text-[13px] font-medium">Data Integration</span>
            <strong className="text-[#173f35] text-2xl font-extrabold tracking-tight">Live Zoho Feed</strong>
          </div>
        </div>

        {/* Title corresponding to document */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight font-serif border-b-2 border-slate-200 pb-2 inline-block">
            Zoho Books – Practical Problem Test
          </h2>
        </div>

        {/* Table styled identically to the screenshot */}
        <div className="w-full overflow-x-auto border border-slate-300 rounded-lg bg-white shadow-md">
          {loading ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#002060]" />
              <p className="text-sm font-medium">Loading Zoho Books Live data...</p>
            </div>
          ) : (
            <table className="w-full min-w-[950px] border-collapse border border-slate-300">
              <thead className="bg-[#002060] text-white">
                <tr className="divide-x divide-slate-300">
                  <th className="p-3.5 border-b border-slate-300 text-center whitespace-nowrap bg-[#002060] text-[14px] font-bold">
                    May 2026
                  </th>
                  <th className="p-3.5 border-b border-slate-300 text-center whitespace-nowrap bg-[#002060] text-[14px] font-bold">
                    Budget<br /><span className="text-[12px] font-normal font-sans">(Put Manually)</span>
                  </th>
                  <th className="p-3.5 border-b border-slate-300 text-center whitespace-nowrap bg-[#002060] text-[14px] font-bold">
                    Variance
                  </th>
                  <th className="p-3.5 border-b border-slate-300 text-center whitespace-nowrap bg-[#002060] text-[14px] font-bold min-w-[240px]">
                    Profit &amp; Loss
                  </th>
                  <th className="p-3.5 border-b border-slate-300 text-center whitespace-nowrap bg-[#002060] text-[14px] font-bold">
                    April 2026
                  </th>
                  <th className="p-3.5 border-b border-slate-300 text-center whitespace-nowrap bg-[#002060] text-[14px] font-bold">
                    Budget
                  </th>
                  <th className="p-3.5 border-b border-slate-300 text-center whitespace-nowrap bg-[#002060] text-[14px] font-bold">
                    Variance
                  </th>
                </tr>
                <tr className="bg-slate-50 text-slate-700 text-xs font-bold text-center divide-x divide-slate-300 border-b border-slate-300">
                  <td className="p-2.5 font-bold">A</td>
                  <td className="p-2.5 font-bold">B</td>
                  <td className="p-2.5 font-bold">C = A - B</td>
                  <td className="p-2.5"></td>
                  <td className="p-2.5 font-bold">D</td>
                  <td className="p-2.5 font-bold">E</td>
                  <td className="p-2.5 font-bold">F = D - E</td>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {actualRows?.map((row, index) => (
                  <React.Fragment key={row.id}>
                    {/* Render Centered Section Group Headers */}
                    {(index === 0 || index === 2) && (
                      <tr className="bg-slate-50 text-xs font-extrabold uppercase divide-x divide-slate-300">
                        <td className="p-3 bg-slate-50"></td>
                        <td className="p-3 bg-slate-50"></td>
                        <td className="p-3 bg-slate-50"></td>
                        <td className="p-3 text-center text-[12px] font-black text-slate-800 tracking-wider bg-slate-50">
                          {row.group}
                        </td>
                        <td className="p-3 bg-slate-50"></td>
                        <td className="p-3 bg-slate-50"></td>
                        <td className="p-3 bg-slate-50"></td>
                      </tr>
                    )}

                    {/* Render Line/Total/Net Row Item */}
                    <tr
                      className={`divide-x divide-slate-300 transition-colors ${
                        row.type === "total"
                          ? "font-bold bg-slate-50/50"
                          : row.type === "net"
                            ? "font-extrabold bg-slate-100 border-t-2 border-b-2 border-slate-400 text-slate-900"
                            : "hover:bg-slate-50/40"
                      }`}
                    >
                      {/* May Actual */}
                      <td className="p-3 text-right whitespace-nowrap text-sm">
                        {row.type === "line" && row.account_id ? (
                          <button
                            onClick={() => handleAccountClick(row.id, row.account_id || "", "2026-05")}
                            className="text-blue-600 hover:text-blue-800 underline font-semibold cursor-pointer"
                          >
                            {formatCurrency(row.may)}
                          </button>
                        ) : (
                          <span className={row.type !== "line" ? "font-bold" : ""}>
                            {formatCurrency(row.may)}
                          </span>
                        )}
                      </td>

                      {/* May Budget */}
                      <td className={`p-3 text-right whitespace-nowrap text-sm text-slate-700 ${row.type !== "line" ? "font-bold" : ""}`}>
                        {formatCurrency(row.mayBudget)}
                      </td>

                      {/* May Variance */}
                      <td
                        className={`p-3 text-right whitespace-nowrap text-sm font-semibold ${
                          row.may - row.mayBudget < 0 ? "text-[#b42318]" : "text-[#067647]"
                        } ${row.type !== "line" ? "font-bold" : ""}`}
                      >
                        {formatCurrency(row.may - row.mayBudget)}
                      </td>

                      {/* Account/Profit & Loss Description */}
                      <td
                        className={`p-3 text-center whitespace-nowrap text-sm ${
                          row.type !== "line" ? "font-bold text-slate-900" : "text-slate-700 font-medium"
                        }`}
                      >
                        {row.label}
                      </td>

                      {/* April Actual */}
                      <td className="p-3 text-right whitespace-nowrap text-sm">
                        {row.type === "line" && row.account_id ? (
                          <button
                            onClick={() => handleAccountClick(row.id, row.account_id || "", "2026-04")}
                            className="text-blue-600 hover:text-blue-800 underline font-semibold cursor-pointer"
                          >
                            {formatCurrency(row.april)}
                          </button>
                        ) : (
                          <span className={row.type !== "line" ? "font-bold" : ""}>
                            {formatCurrency(row.april)}
                          </span>
                        )}
                      </td>

                      {/* April Budget */}
                      <td className={`p-3 text-right whitespace-nowrap text-sm text-slate-700 ${row.type !== "line" ? "font-bold" : ""}`}>
                        {formatCurrency(row.aprilBudget)}
                      </td>

                      {/* April Variance */}
                      <td
                        className={`p-3 text-right whitespace-nowrap text-sm font-semibold ${
                          row.april - row.aprilBudget < 0 ? "text-[#b42318]" : "text-[#067647]"
                        } ${row.type !== "line" ? "font-bold" : ""}`}
                      >
                        {formatCurrency(row.april - row.aprilBudget)}
                      </td>
                    </tr>

                    {/* Render Blank Separator Rows between sections */}
                    {(index === 1 || index === 3) && (
                      <tr className="h-6 bg-white divide-x divide-slate-300">
                        <td className="p-2 border border-slate-300 bg-white"></td>
                        <td className="p-2 border border-slate-300 bg-white"></td>
                        <td className="p-2 border border-slate-300 bg-white"></td>
                        <td className="p-2 border border-slate-300 bg-white"></td>
                        <td className="p-2 border border-slate-300 bg-white"></td>
                        <td className="p-2 border border-slate-300 bg-white"></td>
                        <td className="p-2 border border-slate-300 bg-white"></td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </>
  );
};

export default ReportsPage;
