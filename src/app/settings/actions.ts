"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";

export async function updateBudget(newBudget: any) {
  const filePath = path.join(process.cwd(), "src/data/budget.json");
  await fs.writeFile(filePath, JSON.stringify(newBudget, null, 2), "utf-8");
  revalidatePath("/settings");
  revalidatePath("/reports");
}
