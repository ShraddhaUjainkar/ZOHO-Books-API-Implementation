"use server";

import { ReportService } from "@/src/services/ReportService";
import { getEnrichedTransactions } from "@/src/services/TransactionService";
import { getCookies } from "@/src/lib/cookies";

export async function getActuals() {
  const reportService = new ReportService();
  const data = await reportService.getActuals();
  return data;
}

export async function getTransactions(accountId: string, fromDate: string, toDate: string) {
  const token = await getCookies("access_token");
  const headers = { Authorization: `Zoho-oauthtoken ${token}` };

  try {
    const res = await getEnrichedTransactions(accountId, fromDate, toDate, headers);
    return res.transactions.map((t) => {
      const debit = typeof t.debit === "string" ? parseFloat(t.debit) || 0 : t.debit || 0;
      const credit = typeof t.credit === "string" ? parseFloat(t.credit) || 0 : t.credit || 0;
      const amount = debit || credit || 0;

      return {
        date: t.date,
        account: t.account || "—",
        vendor: t.vendor || "—",
        type: t.type || "—",
        transaction_number: t.transaction_number || "—",
        reference: t.reference || "—",
        debit,
        credit,
        amount,
        documents: t.documents.map((d) => ({
          name: d.file_name,
          url: d.url,
        })),
        transaction_id: t.transaction_id,
      };
    });
  } catch (error) {
    console.error("Failed in getTransactions server action:", error);
    return [];
  }
}
