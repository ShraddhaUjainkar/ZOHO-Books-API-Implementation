"use server";

import { BillService } from "@/src/services/BillService";

const billService = new BillService();

export async function getBills() {
  return billService.getBills();
}
