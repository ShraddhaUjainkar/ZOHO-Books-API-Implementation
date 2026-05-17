import { apiClient } from "@/src/lib/apiClient";

// ─── Concurrent Queue Helper (replaces external p-limit dependency) ───────────
function pLimit(concurrency: number) {
  const queue: (() => Promise<any>)[] = [];
  let activeCount = 0;

  const next = () => {
    if (activeCount < concurrency && queue.length > 0) {
      const task = queue.shift()!;
      activeCount++;
      task().finally(() => {
        activeCount--;
        next();
      });
    }
  };

  return <T>(fn: () => Promise<T>): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
      queue.push(() => fn().then(resolve, reject));
      next();
    });
  };
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ZohoTransaction {
  date: string;
  transaction_id: string;
  entity_type: string;
  entity_type_formatted: string;
  customer_name: string;
  customer_id: string;
  reference_number: string;
  debit: number | string;
  credit: number | string;
}

interface EnrichedDocument {
  file_name: string;
  url: string;
}

interface EnrichedTransaction {
  date: string;
  account: string;
  vendor: string;
  type: string;
  transaction_number: string;
  reference: string;
  debit: number | string;
  credit: number | string;
  documents: EnrichedDocument[];
  transaction_id: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ENTITY_CONFIG: Record<string, { endpoint: string; listKey: string; recordKey: string; idKey: string; numberKey: string }> = {
  bill:         { endpoint: "bills",          listKey: "bills",    recordKey: "bill",    idKey: "bill_id",    numberKey: "bill_number"    },
  vendor_bill:  { endpoint: "bills",          listKey: "bills",    recordKey: "bill",    idKey: "bill_id",    numberKey: "bill_number"    },
  invoice:      { endpoint: "invoices",       listKey: "invoices", recordKey: "invoice", idKey: "invoice_id", numberKey: "invoice_number" },
  customer_invoice: { endpoint: "invoices",   listKey: "invoices", recordKey: "invoice", idKey: "invoice_id", numberKey: "invoice_number" },
  expense:      { endpoint: "expenses",       listKey: "expenses", recordKey: "expense", idKey: "expense_id", numberKey: "expense_number" },
  vendor_payment: { endpoint: "vendorpayments", listKey: "vendorpayments", recordKey: "vendorpayment", idKey: "vendorpayment_id", numberKey: "payment_number" },
  customer_payment: { endpoint: "customerpayments", listKey: "payments", recordKey: "payment", idKey: "payment_id", numberKey: "payment_number" },
};

// ─── Document cache (per process lifetime) ────────────────────────────────────
// Keyed by document_id — avoids re-fetching the same PDF across transactions
const documentCache = new Map<string, EnrichedDocument>();

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function filterByDate(txns: ZohoTransaction[], fromDate: string, toDate: string) {
  return txns.filter((t) => {
    const iso = normalizeDate(t.date);
    return iso >= fromDate && iso <= toDate;
  });
}

async function fetchDocument(
  endpoint: string,
  recordId: string,
  doc: { document_id: string; file_name: string },
  headers: HeadersInit,
  orgId: string,
): Promise<EnrichedDocument> {
  if (documentCache.has(doc.document_id)) {
    return documentCache.get(doc.document_id)!;
  }

  try {
    const url = `${process.env.ZOHO_API_BASE_URL}/${endpoint}/${recordId}/documents/${doc.document_id}?organization_id=${orgId}`;
    const res = await fetch(url, { headers });

    if (res.ok) {
      const contentType = res.headers.get("content-type") || "application/pdf";
      const buffer = await res.arrayBuffer();
      const result: EnrichedDocument = {
        file_name: doc.file_name,
        url: `data:${contentType};base64,${Buffer.from(buffer).toString("base64")}`,
      };
      documentCache.set(doc.document_id, result);
      return result;
    }
  } catch {
    // fall through to empty url
  }

  return { file_name: doc.file_name, url: "" };
}

async function resolveRecord(
  txn: ZohoTransaction,
  config: (typeof ENTITY_CONFIG)[string],
  headers: HeadersInit,
  orgId: string,
) {
  const isVendor = config.listKey === "bills";
  const idParam = isVendor ? `vendor_id` : `customer_id`;

  // Search by contact + date (most selective combo available without bill ID)
  const searchUrl = `${process.env.ZOHO_API_BASE_URL}/${config.endpoint}?${idParam}=${txn.customer_id}&date=${normalizeDate(txn.date)}&organization_id=${orgId}`;
  const listData = await apiClient<any>(searchUrl, { headers }).catch(() => null);
  const items: any[] = listData?.[config.listKey] ?? [];

  if (!items.length) return null;

  // Match by amount — prefer exact, fall back to closest
  const amount = Math.abs(Number(txn.debit || txn.credit || 0));
  const exact = items.find((item) => Math.abs((item.total ?? item.amount ?? 0) - amount) < 1);
  const matched = exact ?? items.reduce((best, item) => {
    const diff = Math.abs((item.total ?? item.amount ?? 0) - amount);
    const bestDiff = Math.abs((best.total ?? best.amount ?? 0) - amount);
    return diff < bestDiff ? item : best;
  });

  if (!matched) return null;

  const recordId = matched[config.idKey];
  const detailUrl = `${process.env.ZOHO_API_BASE_URL}/${config.endpoint}/${recordId}?organization_id=${orgId}`;
  const detail = await apiClient<any>(detailUrl, { headers }).catch(() => null);
  return detail?.[config.recordKey] ?? null;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export async function getEnrichedTransactions(
  accountId: string,
  fromDate: string,
  toDate: string,
  headers: HeadersInit,
): Promise<{ account_name: string; transactions: EnrichedTransaction[] }> {
  const orgId = process.env.ZOHO_ORG_ID!;

  // 1. Fetch account + transactions
  const coaData = await apiClient<any>(
    `${process.env.ZOHO_API_BASE_URL}/chartofaccounts/${accountId}?organization_id=${orgId}`,
    { headers },
  );

  const account = coaData.chart_of_account;
  const txns: ZohoTransaction[] = filterByDate(account.transactions ?? [], fromDate, toDate);

  // 2. Process transactions with concurrency cap (3 at a time → safe for Zoho rate limits)
  const limit = pLimit(3);

  const enriched = await Promise.all(
    txns.map((txn) =>
      limit(async (): Promise<EnrichedTransaction> => {
        const config = ENTITY_CONFIG[txn.entity_type];

        // Unknown entity type — return what we have, skip enrichment
        if (!config) {
          return {
            date: normalizeDate(txn.date),
            account: account.account_name,
            vendor: txn.customer_name,
            type: txn.entity_type_formatted || txn.entity_type,
            transaction_number: "—",
            reference: txn.reference_number,
            debit: txn.debit,
            credit: txn.credit,
            documents: [],
            transaction_id: txn.transaction_id,
          };
        }

        const record = await resolveRecord(txn, config, headers, orgId);

        // 3. Fetch documents in parallel (with cache)
        const rawDocs: { document_id: string; file_name: string }[] = record?.documents ?? [];
        const recordId = record?.[config.idKey] ?? txn.transaction_id;

        const documents = await Promise.all(
          rawDocs.map((doc) => fetchDocument(config.endpoint, recordId, doc, headers, orgId)),
        );

        return {
          date: normalizeDate(txn.date),
          account: account.account_name,
          vendor: txn.customer_name,
          type: txn.entity_type_formatted || txn.entity_type,
          transaction_number: record?.[config.numberKey] ?? "—",
          reference: txn.reference_number,
          debit: txn.debit,
          credit: txn.credit,
          documents,
          transaction_id: txn.transaction_id,
        };
      }),
    ),
  );

  return { account_name: account.account_name, transactions: enriched };
}
