/**
 * Extracts a specific group total and its primary account (like Sales or COGS)
 * from the nested Zoho Profit and Loss structure.
 */
export function extractZohoSection(
  reportData: any,
  rootArr: string,
  sectionName: string,
  accountName: string,
) {
  const data = reportData.profit_and_loss;
  const list = data.find((item: any) => item.name === rootArr);

  // 1. Find the main section (e.g., "Operating Income")
  const section = list?.account_transactions?.find(
    (item: any) => item.name == sectionName,
  );
  if (!section) return { total: 0, accountTotal: 0, accountId: null };

  // 2. Find the specific account within that section (e.g., "Sales")
  const primaryAccount = section.account_transactions?.find(
    (acc: any) => acc.name === accountName,
  );

  return {
    groupName: section.name,
    groupTotal: section.total || 0,
    groupLabel: section.total_label || "",
    accountName: primaryAccount?.name || accountName,
    accountTotal: primaryAccount?.total || 0,
    accountId: primaryAccount?.account_id || null, // Crucial for Note 2 drill-down
  };
}
