import { PageHeader } from "@/src/components/PageHeader";
import { DirectorySummary } from "@/src/components/DirectorySummary";
import { getInvoices } from "@/src/actions/invoices";

export default async function InvoicesPage() {
  const invoices = await getInvoices();

  return (
    <section className="flex flex-col flex-1 p-5 md:p-7 overflow-x-auto min-w-0">
      <PageHeader title="Invoices Directory" />

      <DirectorySummary
        totalLabel="Total Invoices"
        totalCount={invoices.length}
      />

      {invoices.length === 0 ? (
        <div className="p-4 bg-slate-50 border border-[#e4e8dd] text-slate-500 rounded-lg">
          No invoices found in your Zoho Books account.
        </div>
      ) : (
        <div className="w-full overflow-x-auto border border-[#d9dfd1] rounded-lg bg-white shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8faf6] border-b border-[#e4e8dd] text-xs uppercase text-slate-500 font-extrabold">
                <th className="p-4">Date</th>
                <th className="p-4">Invoice #</th>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4 text-right">Balance Due</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice: any) => (
                <tr
                  key={invoice.invoice_id}
                  className="border-b border-[#e4e8dd] hover:bg-slate-50 transition-colors"
                >
                  <td className="p-4 text-sm text-slate-600">{invoice.date}</td>
                  <td className="p-4 font-bold text-[#14213d]">
                    {invoice.invoice_number}
                  </td>
                  <td className="p-4 text-sm font-semibold text-slate-700">
                    {invoice.customer_name}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 text-xs font-bold rounded-full ${
                        invoice.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : invoice.status === "sent"
                            ? "bg-blue-100 text-blue-700"
                            : invoice.status === "overdue"
                              ? "bg-red-100 text-red-700"
                              : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {invoice.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-right text-sm text-slate-600">
                    {invoice.currency_symbol}
                    {invoice.total?.toFixed(2)}
                  </td>
                  <td className="p-4 text-right font-bold text-[#173f35]">
                    {invoice.currency_symbol}
                    {invoice.balance?.toFixed(2)}
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No invoices found in your Zoho Books account.
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
