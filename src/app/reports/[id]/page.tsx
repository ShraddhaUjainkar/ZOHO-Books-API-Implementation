"use client";

import React, { useEffect, useState, use } from "react";
import { FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getTransactions } from "@/src/actions/actuals";

interface Transaction {
  date: string;
  account: string;
  vendor: string;
  type: string;
  transaction_number: string;
  reference: string;
  debit: number;
  credit: number;
  amount: number;
  documents: any[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    value,
  );
}

export default function ReportDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ aid?: string; month?: string }>;
}) {
  const { id } = use(params);
  const resolvedSearch = use(
    searchParams ?? Promise.resolve({} as { aid?: string; month?: string }),
  );

  const accountId = resolvedSearch.aid ? atob(resolvedSearch.aid) : id;

  // Derive date range from the month param (e.g. '2026-05' → '2026-05-01' / '2026-05-31')
  const month = resolvedSearch.month ?? "2026-05";
  const [year, mon] = month.split("-").map(Number);
  const fromDate = `${month}-01`;

  const lastDay = new Date(year, mon, 0).getDate(); // day 0 of next month = last day of this month
  const toDate = `${month}-${String(lastDay).padStart(2, "0")}`;

  const [activeTransactions, setActiveTransactions] = useState<Transaction[]>(
    [],
  );
  const [activeTotal, setActiveTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (accountId) {
      fetchTransactions(accountId);
    }
  }, [accountId]);

  const fetchTransactions = async (accId: string) => {
    setIsLoading(true);
    try {
      const transactions = await getTransactions(accId, fromDate, toDate);
      setActiveTransactions(transactions);
      setActiveTotal(
        transactions.reduce(
          (sum: number, transaction: Transaction) => sum + transaction.amount,
          0,
        ),
      );
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      setActiveTransactions([]);
      setActiveTotal(0);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="flex flex-col flex-1 p-5 md:p-7 overflow-x-auto min-w-0 bg-white">
      <header className="flex items-center justify-between gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <Link
            href="/reports"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-[#173f35] mb-2 text-sm font-bold"
          >
            <ArrowLeft size={16} /> Back to Reports
          </Link>
          <h1 className="text-2xl font-bold text-[#173f35] tracking-tight flex items-center gap-2 capitalize">
            {id.replace("-", " ")} Transactions
            <span className="text-sm font-normal text-slate-500 px-2.5 py-0.5 bg-slate-100 rounded-full border border-slate-200 uppercase font-sans">
              {new Date(year, mon - 1).toLocaleString("en-US", { month: "long", year: "numeric" })}
            </span>
          </h1>
        </div>
      </header>

      <div className="flex justify-between my-[22px] p-[20px] rounded-lg text-white bg-[#173f35] text-xl shadow-sm">
        <span>Total Amount</span>
        <strong>{formatCurrency(activeTotal)}</strong>
      </div>

      <div className="bg-white rounded-xl border border-[#e4e8dd] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-[#334155]">
            <thead className="bg-[#f8fafc] text-left text-xs font-bold text-[#64748b] uppercase tracking-wider">
              <tr>
                <th className="p-4 border-b border-[#e4e8dd] whitespace-nowrap">
                  Date
                </th>
                <th className="p-4 border-b border-[#e4e8dd] whitespace-nowrap">
                  Account
                </th>
                <th className="p-4 border-b border-[#e4e8dd] whitespace-nowrap">
                  Transaction Details
                </th>
                <th className="p-4 border-b border-[#e4e8dd] whitespace-nowrap">
                  Transaction Type
                </th>
                <th className="p-4 border-b border-[#e4e8dd] whitespace-nowrap">
                  Transaction#
                </th>
                <th className="p-4 border-b border-[#e4e8dd] whitespace-nowrap">
                  Reference#
                </th>
                <th className="p-4 border-b border-[#e4e8dd] text-right whitespace-nowrap">
                  Debit
                </th>
                <th className="p-4 border-b border-[#e4e8dd] text-right whitespace-nowrap">
                  Credit
                </th>
                <th className="p-4 border-b border-[#e4e8dd] text-right whitespace-nowrap">
                  Amount
                </th>
                <th className="p-4 border-b border-[#e4e8dd] text-center whitespace-nowrap">
                  Attachments
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e4e8dd]">
              {isLoading ? (
                // Skeleton loader rows
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    {Array.from({ length: 10 }).map((_, col) => (
                      <td key={col} className="p-4">
                        <div
                          className={`h-3 bg-slate-100 rounded ${
                            col === 0
                              ? "w-20"
                              : col === 1
                                ? "w-32"
                                : col === 2
                                  ? "w-28"
                                  : col === 3
                                    ? "w-16"
                                    : col === 4
                                      ? "w-20"
                                      : col === 5
                                        ? "w-12"
                                        : col >= 6 && col <= 8
                                          ? "w-16 ml-auto"
                                          : "w-24"
                          }`}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : activeTransactions.length > 0 ? (
                activeTransactions.map((transaction, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-[#fbfcf8] transition-colors"
                  >
                    <td className="p-4 whitespace-nowrap font-medium text-[#14213d]">
                      {transaction.date}
                    </td>
                    <td className="p-4">{transaction.account}</td>
                    <td className="p-4">{transaction.vendor}</td>
                    <td className="p-4">{transaction.type}</td>
                    <td className="p-4 font-mono text-xs">
                      {transaction.transaction_number}
                    </td>
                    <td className="p-4 font-mono text-xs">
                      {transaction.reference}
                    </td>
                    <td className="p-4 text-right text-blue-600">
                      {transaction.debit
                        ? formatCurrency(transaction.debit)
                        : ""}
                    </td>
                    <td className="p-4 text-right text-red-600">
                      {transaction.credit
                        ? formatCurrency(transaction.credit)
                        : ""}
                    </td>
                    <td className="p-4 text-right font-medium text-[#116149] whitespace-nowrap">
                      {transaction.amount
                        ? formatCurrency(transaction.amount)
                        : ""}{" "}
                      {transaction.debit
                        ? "Dr"
                        : transaction.credit
                          ? "Cr"
                          : ""}
                    </td>
                    <td className="p-4">
                      {transaction.documents?.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {transaction.documents.map((doc, i) =>
                            doc.url ? (
                              <a
                                key={i}
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#116149] hover:underline inline-flex items-center gap-1 text-xs font-medium"
                                title="Download attachment"
                              >
                                <FileText size={13} />
                                {doc.name}
                              </a>
                            ) : (
                              <span
                                key={i}
                                className="text-slate-500 inline-flex items-center gap-1 text-xs"
                                title={doc.name}
                              >
                                <FileText size={13} />
                                {doc.name}
                              </span>
                            ),
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-500">
                    No transactions found for this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
