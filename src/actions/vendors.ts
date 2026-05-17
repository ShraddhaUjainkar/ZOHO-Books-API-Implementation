"use server";

import { VendorService } from "@/src/services/VendorService";

const vendorService = new VendorService();

export async function getVendors() {
  return vendorService.getVendors();
}
