"use server";

import { InvoiceService } from "@/src/services/InvoiceService";

const invoiceService = new InvoiceService();

export async function getInvoices() {
  return invoiceService.getInvoices();
}
