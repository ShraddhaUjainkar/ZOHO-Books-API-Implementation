import { ZohoRepository } from "@/src/repositories/ZohoRepository";
import { extractZohoSection } from "../lib/reportUtils";
import budgetData from "../data/budget.json";

export class ReportService {
  private zohoRepo: ZohoRepository;

  constructor() {
    this.zohoRepo = new ZohoRepository();
  }

  async getActualsForMonth(month: string) {
    const [year, mon] = month.split("-").map(Number);
    const fromDate = `${month}-01`;
    const lastDay = new Date(year, mon, 0).getDate();
    const toDate = `${month}-${String(lastDay).padStart(2, "0")}`;

    const section = await this.zohoRepo.getPLReport(fromDate, toDate);

    const incomeData = extractZohoSection(
      section,
      "Gross Profit",
      "Operating Income",
      "Sales",
    );

    const cogsData = extractZohoSection(
      section,
      "Gross Profit",
      "Cost of Goods Sold",
      "Cost of Goods Sold",
    );

    const netProfit = section.profit_and_loss ?? [];
    const netProfitTotal = netProfit.find(
      (item: any) => item.name === "Net Profit/Loss",
    );

    // Map month string (e.g., '2026-05') to budget keys ('may' or 'april')
    const budgetKey = month.endsWith("-05") ? "may" : "april";

    const finalRows = [
      {
        id: "sales",
        label: "Sales",
        group: incomeData.groupName,
        type: "line",
        account_id: incomeData.accountId,
        actual: incomeData.accountTotal,
        budget: budgetData.sales[budgetKey] || 0,
      },
      {
        id: "income-total",
        label: `Total for ${incomeData.groupName || "Operating Income"}`,
        group: incomeData.groupName,
        type: "total",
        account_id: null,
        actual: incomeData.groupTotal,
        budget: budgetData.sales[budgetKey] || 0,
      },
      {
        id: "cogs",
        label: "Cost of Goods Sold",
        group: cogsData.groupName,
        type: "line",
        account_id: cogsData.accountId,
        actual: cogsData.accountTotal,
        budget: budgetData.cogs[budgetKey] || 0,
      },
      {
        id: "cogs-total",
        label: `Total for ${cogsData.groupName || "Cost of Goods Sold"}`,
        group: cogsData.groupName,
        type: "total",
        account_id: null,
        actual: cogsData.groupTotal,
        budget: budgetData.cogs[budgetKey] || 0,
      },
      {
        id: "net-profit",
        label: "Net Profit/Loss",
        group: null,
        type: "net",
        account_id: null,
        actual: netProfitTotal?.total || 0,
        budget: budgetData["net-profit"][budgetKey] || 0,
      },
    ];

    console.log(`[ReportService] fetched report for ${month}`, finalRows);
    return finalRows;
  }

  async getActuals() {
    const [sectionApril, sectionMay] = await Promise.all([
      this.zohoRepo.getPLReport("2026-04-01", "2026-04-30"),
      this.zohoRepo.getPLReport("2026-05-01", "2026-05-31"),
    ]);

    const incomeApril = extractZohoSection(
      sectionApril,
      "Gross Profit",
      "Operating Income",
      "Sales",
    );
    const incomeMay = extractZohoSection(
      sectionMay,
      "Gross Profit",
      "Operating Income",
      "Sales",
    );

    const cogsApril = extractZohoSection(
      sectionApril,
      "Gross Profit",
      "Cost of Goods Sold",
      "Cost of Goods Sold",
    );
    const cogsMay = extractZohoSection(
      sectionMay,
      "Gross Profit",
      "Cost of Goods Sold",
      "Cost of Goods Sold",
    );

    const netProfitApril = sectionApril.profit_and_loss ?? [];
    const netProfitMay = sectionMay.profit_and_loss ?? [];

    const netProfitTotalApril = netProfitApril.find(
      (item: any) => item.name === "Net Profit/Loss",
    );
    const netProfitTotalMay = netProfitMay.find(
      (item: any) => item.name === "Net Profit/Loss",
    );

    const finalRows = [
      {
        id: "sales",
        label: "Sales",
        group:
          incomeMay.groupName || incomeApril.groupName || "Operating Income",
        type: "line",
        account_id: incomeMay.accountId || incomeApril.accountId,
        may: incomeMay.accountTotal,
        mayBudget: budgetData.sales.may || 0,
        april: incomeApril.accountTotal,
        aprilBudget: budgetData.sales.april || 0,
      },
      {
        id: "income-total",
        label: `Total for ${incomeMay.groupName || incomeApril.groupName || "Operating Income"}`,
        group:
          incomeMay.groupName || incomeApril.groupName || "Operating Income",
        type: "total",
        account_id: null,
        may: incomeMay.groupTotal,
        mayBudget: budgetData.sales.may || 0,
        april: incomeApril.groupTotal,
        aprilBudget: budgetData.sales.april || 0,
      },
      {
        id: "cogs",
        label: "Cost of Goods Sold",
        group: cogsMay.groupName || cogsApril.groupName || "Cost of Goods Sold",
        type: "line",
        account_id: cogsMay.accountId || cogsApril.accountId,
        may: cogsMay.accountTotal,
        mayBudget: budgetData.cogs.may || 0,
        april: cogsApril.accountTotal,
        aprilBudget: budgetData.cogs.april || 0,
      },
      {
        id: "cogs-total",
        label: `Total for ${cogsMay.groupName || cogsApril.groupName || "Cost of Goods Sold"}`,
        group: cogsMay.groupName || cogsApril.groupName || "Cost of Goods Sold",
        type: "total",
        account_id: null,
        may: cogsMay.groupTotal,
        mayBudget: budgetData.cogs.may || 0,
        april: cogsApril.groupTotal,
        aprilBudget: budgetData.cogs.april || 0,
      },
      {
        id: "net-profit",
        label: "Net Profit/Loss",
        group: null,
        type: "net",
        account_id: null,
        may: netProfitTotalMay?.total || 0,
        mayBudget: budgetData["net-profit"].may || 0,
        april: netProfitTotalApril?.total || 0,
        aprilBudget: budgetData["net-profit"].april || 0,
      },
    ];

    return finalRows;
  }
}
