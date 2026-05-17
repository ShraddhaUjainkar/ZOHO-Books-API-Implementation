"use client";

import { useState } from "react";
import { updateBudget } from "./actions";

const LABELS: Record<string, string> = {
  sales: "Operating Income",
  cogs: "Cost of Goods Sold",
  "net-profit": "Net Profit",
};

export default function BudgetForm({ initialBudget }: { initialBudget: any }) {
  const [budget, setBudget] = useState(initialBudget);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    await updateBudget(budget);
    setIsEditing(false);
    setIsLoading(false);
  };

  const handleChange = (key: string, value: string) => {
    const numValue = parseInt(value.replace(/,/g, ""), 10) || 0;
    setBudget({
      ...budget,
      [key]: {
        ...budget[key],
        may: numValue,
      },
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-[#14213d] mb-2">
            Budget Defaults
          </h3>
          <p className="text-sm text-slate-500">
            Manage standard monthly budget allocations for your major account groups.
          </p>
        </div>
        <button
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          disabled={isLoading}
          className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors ${
            isEditing
              ? "bg-[#173f35] text-white hover:bg-[#113028]"
              : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
          }`}
        >
          {isLoading ? "Saving..." : isEditing ? "Save Changes" : "Edit Budget"}
        </button>
      </div>

      <div className="grid gap-4">
        {["sales", "cogs", "net-profit"].map((key) => (
          <div
            key={key}
            className="flex items-center justify-between gap-4 p-3 border border-[#e4e8dd] rounded-lg bg-[#fbfcf8]"
          >
            <span className="font-semibold text-sm text-[#14213d]">
              {LABELS[key] || budget[key].label}
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                className={`w-32 p-2 border rounded text-right text-sm ${
                  isEditing ? "border-[#173f35] bg-white" : "border-[#cad3c0] bg-slate-50"
                }`}
                value={isEditing ? budget[key].may : budget[key].may.toLocaleString()}
                onChange={(e) => handleChange(key, e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
