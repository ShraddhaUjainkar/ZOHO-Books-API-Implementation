import { InvoiceRepository } from "../repositories/InvoiceRepository";

export class InvoiceService {
  private repo: InvoiceRepository;

  constructor() {
    this.repo = new InvoiceRepository();
  }

  async getInvoices() {
    const data = await this.repo.getInvoices();
    console.log("invoices", data.invoices);
    return data.invoices ?? [];
  }
}
