import { BillRepository } from "../repositories/BillRepository";

export class BillService {
  private repo: BillRepository;

  constructor() {
    this.repo = new BillRepository();
  }

  async getBills() {
    const data = await this.repo.getBills();
    return data.bills ?? [];
  }
}
