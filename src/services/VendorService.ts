import { VendorRepository } from "../repositories/VendorRepository";

export class VendorService {
  private repo: VendorRepository;

  constructor() {
    this.repo = new VendorRepository();
  }

  async getVendors() {
    const data = await this.repo.getVendors();
    return data.contacts ?? [];
  }
}
