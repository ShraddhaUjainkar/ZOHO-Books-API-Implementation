import { getCookies } from "@/src/lib/cookies";
import { apiClient } from "@/src/lib/apiClient";

export class InvoiceRepository {
  private async getHeaders() {
    const token = await getCookies("access_token");
    return { Authorization: `Zoho-oauthtoken ${token}` };
  }

  async getInvoices() {
    const orgId = process.env.ZOHO_ORG_ID;
    const headers = await this.getHeaders();
    const url = `${process.env.ZOHO_API_BASE_URL}/invoices?organization_id=${orgId}`;

    return apiClient<any>(url, { headers, next: { revalidate: 3600 } });
  }
}
