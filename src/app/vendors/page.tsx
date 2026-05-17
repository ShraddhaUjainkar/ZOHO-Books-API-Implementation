import React from "react";
import { Search, RefreshCw, Building2 } from "lucide-react";
import { getVendors } from "@/src/actions/vendors";
import { DirectorySummary } from "@/src/components/DirectorySummary";
import { PageHeader } from "@/src/components/PageHeader";

export default async function VendorsPage() {
  const vendors = await getVendors();
  const error = null;

  return (
    <section className="flex flex-col flex-1 p-5 md:p-7 overflow-x-auto min-w-0">
      <PageHeader title="Vendors Directory" />

      <DirectorySummary
        totalLabel="Total Vendors"
        totalCount={vendors.length}
      />

      {error ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          <strong>Error fetching vendors:</strong> {error}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vendors.map((vendor: any) => (
            <div
              key={vendor.contact_id}
              className="p-5 border border-[#d9dfd1] rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#f8faf6] flex items-center justify-center text-[#116149] border border-[#e4e8dd]">
                  <Building2 size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[#14213d] truncate">
                    {vendor.contact_name}
                  </h3>
                  <p className="text-xs text-slate-500 truncate">
                    {vendor.email || "No email provided"}
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-[#e4e8dd] flex justify-between items-center text-sm">
                <span className="text-slate-500">Payables:</span>
                <strong className="text-[#116149]">
                  ₹{vendor.outstanding_payable_amount?.toFixed(2) || "0.00"}
                </strong>
              </div>
            </div>
          ))}
          {vendors.length === 0 && !error && (
            <div className="col-span-full p-8 text-center text-slate-500 bg-white border border-[#d9dfd1] rounded-xl">
              No vendors found in your Zoho Books account.
            </div>
          )}
        </div>
      )}
    </section>
  );
}
