import React from "react";

interface DirectorySummaryProps {
  totalLabel: string;
  totalCount: number;
  error?: string | boolean | null;
}

export function DirectorySummary({
  totalLabel,
  totalCount,
  error,
}: DirectorySummaryProps) {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 my-6 p-4 border border-[#d9dfd1] rounded-lg bg-white shadow-sm">
      <div className="grid gap-1">
        <span className="text-slate-500 text-[13px]">{totalLabel}</span>
        <strong className="text-[#173f35] text-[22px]">{totalCount}</strong>
      </div>
      <div className="grid gap-1">
        <span className="text-slate-500 text-[13px]">Status</span>
        <strong
          className={`text-[22px] ${error ? "text-red-500" : "text-[#173f35]"}`}
        >
          {error ? "Error" : "Synced"}
        </strong>
      </div>
    </div>
  );
}
