import React from "react";
import { Search, RefreshCw } from "lucide-react";
import { getBills } from "@/src/actions/bills";
import { PageHeader } from "@/src/components/PageHeader";
import { DirectorySummary } from "@/src/components/DirectorySummary";

export default async function BillsPage() {
  const bills = await getBills();
  const error = null;

  return (
    <section className="flex flex-col flex-1 p-5 md:p-7 overflow-x-auto min-w-0">
      <PageHeader title="Bills Directory" />

      <DirectorySummary totalLabel="Total Bills" totalCount={bills.length} />
      {error ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          <strong>Error fetching bills:</strong> {error}
        </div>
      ) : (
        <div className="w-full overflow-x-auto border border-[#d9dfd1] rounded-lg bg-white shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8faf6] border-b border-[#e4e8dd] text-xs uppercase text-slate-500 font-extrabold">
                <th className="p-4">Date</th>
                <th className="p-4">Bill #</th>
                <th className="p-4">Vendor Name</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4 text-right">Balance Due</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((bill: any) => (
                <tr
                  key={bill.bill_id}
                  className="border-b border-[#e4e8dd] hover:bg-slate-50 transition-colors"
                >
                  <td className="p-4 text-sm text-slate-600">{bill.date}</td>
                  <td className="p-4 font-bold text-[#14213d]">
                    {bill.bill_number}
                  </td>
                  <td className="p-4 text-sm font-semibold text-slate-700">
                    {bill.vendor_name}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 text-xs font-bold rounded-full ${
                        bill.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : bill.status === "open"
                            ? "bg-blue-100 text-blue-700"
                            : bill.status === "overdue"
                              ? "bg-red-100 text-red-700"
                              : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {bill.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-right text-sm text-slate-600">
                    {bill.currency_symbol}
                    {bill.total?.toFixed(2)}
                  </td>
                  <td className="p-4 text-right font-bold text-[#173f35]">
                    {bill.currency_symbol}
                    {bill.balance?.toFixed(2)}
                  </td>
                </tr>
              ))}
              {bills.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No bills found in your Zoho Books account.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
