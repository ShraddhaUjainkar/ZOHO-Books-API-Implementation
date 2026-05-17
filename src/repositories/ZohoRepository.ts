import { getCookies } from "@/src/lib/cookies";
import { apiClient } from "@/src/lib/apiClient";

export class ZohoRepository {
  private async getHeaders() {
    const token = await getCookies("access_token");
    return { Authorization: `Zoho-oauthtoken ${token}` };
  }

  async getPLReport(fromDate: string, toDate: string) {
    const orgId = process.env.ZOHO_ORG_ID;
    const headers = await this.getHeaders();
    const url = `${process.env.ZOHO_API_BASE_URL}/reports/profitandloss?organization_id=${orgId}&from_date=${fromDate}&to_date=${toDate}&report_basis=Accrual`;

    return apiClient<any>(url, { headers });
  }

  async getTransactions(accountId: string, fromDate: string, toDate: string) {
    const orgId = process.env.ZOHO_ORG_ID;
    const headers = await this.getHeaders();

    // Step 1: get transactions from chartofaccounts
    // We call BOTH the general account details (for account name) and the dedicated transactions list
    const coaUrl = `${process.env.ZOHO_API_BASE_URL}/chartofaccounts/${accountId}?organization_id=${orgId}`;
    const coaTxnsUrl = `${process.env.ZOHO_API_BASE_URL}/chartofaccounts/transactions?organization_id=${orgId}&account_id=${accountId}`;

    const [coaData, coaTxnsData] = await Promise.all([
      apiClient<any>(coaUrl, { headers }).catch(() => null),
      apiClient<any>(coaTxnsUrl, { headers }).catch(() => null),
    ]);

    // Normalize date: Zoho COA can return DD/MM/YYYY — convert to YYYY-MM-DD for comparison
    const normalizeDate = (raw: string): string => {
      if (!raw) return "";
      // Already ISO format YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
      // DD/MM/YYYY → YYYY-MM-DD
      const [d, m, y] = raw.split("/");
      if (d && m && y)
        return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
      return raw;
    };

    let rawTxns: any[] = [];
    if (coaTxnsData?.transactions && Array.isArray(coaTxnsData.transactions)) {
      rawTxns = coaTxnsData.transactions;
    } else {
      // Fallback: static list from the general account details (only contains recent 5 txns)
      rawTxns = coaData?.chart_of_account?.transactions ?? [];
    }

    // Filter by the selected month date range (fromDate <= date <= toDate)
    const filteredTxns = rawTxns.filter((t: any) => {
      const iso = normalizeDate(t.date);
      return iso >= fromDate && iso <= toDate;
    });

    const txns = filteredTxns.map((t: any) => {
      return {
        transaction_id: t.transaction_id,
        date: normalizeDate(t.date),
        entity_type: t.entity_type ?? t.transaction_type,
        customer_name: t.customer_name ?? t.vendor_name ?? "—",
        customer_id: t.customer_id ?? t.vendor_id,
        debit: t.debit ?? t.debit_amount ?? 0,
        credit: t.credit ?? t.credit_amount ?? 0,
        transaction_number:
          t.transaction_number ??
          t.document_number ??
          t.reference_number ??
          "—",
        reference_number: t.reference_number,
        entity_type_formatted:
          t.entity_type_formatted ?? t.transaction_type_formatted,
      };
    });

    const accountName =
      coaData?.chart_of_account?.account_name ??
      filteredTxns[0]?.account_name ??
      "—";

    // Step 2: fetch bill/invoice details in parallel
    const enriched = await Promise.all(
      txns.map(async (txn: any) => {
        let endpoint = "";
        let recordKey = "";

        // Properly map Zoho's entity types to their respective API endpoints
        switch (txn.entity_type) {
          case "bill":
          case "vendor_bill":
            endpoint = "bills";
            recordKey = "bill";
            break;
          case "invoice":
          case "customer_invoice":
            endpoint = "invoices";
            recordKey = "invoice";
            break;
          case "vendor_payment":
            endpoint = "vendorpayments";
            recordKey = "vendorpayment";
            break;
          case "customer_payment":
            endpoint = "customerpayments";
            recordKey = "payment";
            break;
          case "expense":
            endpoint = "expenses";
            recordKey = "expense";
            break;
          case "journal":
            endpoint = "journals";
            recordKey = "journal";
            break;
          default:
            // Fallback for unknown types
            endpoint = "invoices";
            recordKey = "invoice";
        }

        let record = null;
        if (endpoint) {
          // The transaction_id from COA is a ledger entry ID, NOT the bill/invoice ID.
          // We need to search for the actual document using customer_id and date.
          let searchUrl = "";
          if (txn.entity_type === "bill" || txn.entity_type === "vendor_bill") {
            // Search bills by vendor and date, then match by amount
            searchUrl = `${process.env.ZOHO_API_BASE_URL}/bills?vendor_id=${txn.customer_id}&date=${txn.date}&organization_id=${orgId}`;
          } else if (
            txn.entity_type === "invoice" ||
            txn.entity_type === "customer_invoice"
          ) {
            searchUrl = `${process.env.ZOHO_API_BASE_URL}/invoices?customer_id=${txn.customer_id}&date=${txn.date}&organization_id=${orgId}`;
          }

          if (searchUrl) {
            const listData = await apiClient<any>(searchUrl, { headers }).catch(
              () => null,
            );
            const listKey = recordKey === "bill" ? "bills" : "invoices";
            const items: any[] = listData?.[listKey] ?? [];

            // Match the correct record by amount
            const amount = txn.debit || txn.credit || 0;
            const matched =
              items.find((item: any) => {
                const itemAmount = item.total || item.amount || 0;
                return Math.abs(itemAmount - amount) < 1;
              }) ?? items[0]; // Fallback to first if no amount match

            if (matched) {
              const itemId = matched.bill_id || matched.invoice_id;
              const detailUrl = `${process.env.ZOHO_API_BASE_URL}/${endpoint}/${itemId}?organization_id=${orgId}`;
              const detail = await apiClient<any>(detailUrl, { headers }).catch(
                () => null,
              );
              record = detail?.[recordKey];
            }
          }
        }

        console.log("record", JSON.stringify(record, null, 2));

        // Extract the number depending on the record type
        const transactionNumber =
          txn.transaction_number ??
          txn.document_number ??
          record?.bill_number ??
          record?.invoice_number ??
          record?.expense_number ??
          record?.payment_number ??
          record?.journal_number ??
          "—";

        // Return document metadata only — actual download is handled via /api/documents proxy on click
        const rawDocuments = record?.documents ?? [];
        const recordEntityId =
          record?.bill_id ||
          record?.invoice_id ||
          record?.expense_id ||
          txn.transaction_id;
        const enrichedDocuments = rawDocuments.map((doc: any) => ({
          file_name: doc.file_name,
          document_id: doc.document_id,
          entity: endpoint,
          entity_id: recordEntityId,
        }));

        return {
          date: txn.date,
          account: coaData.chart_of_account.account_name,
          vendor: txn.customer_name,
          type: txn.entity_type_formatted || txn.entity_type,
          transaction_number: transactionNumber,
          reference: txn.reference_number,
          debit: txn.debit,
          credit: txn.credit,
          documents: enrichedDocuments,
          endpoint: endpoint,
          transaction_id: txn.transaction_id,
        };
      }),
    );

    return enriched;
  }
}
