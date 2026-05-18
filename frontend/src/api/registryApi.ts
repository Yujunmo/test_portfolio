import client from "./client";
import type { FundReportContent, ReportFund } from "../pages/MonthlyReport";

interface RegistryItem {
  company_code: string;
  fund_code: string;
  fund_name: string;
  base_year_month: string;
}

export async function fetchRegistry(): Promise<RegistryItem[]> {
  const res = await client.get<RegistryItem[]>("/registry");
  return res.data;
}

export async function addRegistry(fund: ReportFund): Promise<void> {
  await client.post("/registry", {
    company_code: fund.company_code,
    fund_code: fund.fund_code,
    fund_name: fund.fund_name,
    base_year_month: fund.base_year_month,
  });
}

export async function removeRegistry(fundCode: string, baseYearMonth: string): Promise<void> {
  await client.delete(`/registry/${fundCode}/${baseYearMonth}`);
}

export async function fetchContent(fundCode: string, baseYearMonth: string): Promise<FundReportContent> {
  const res = await client.get<FundReportContent>(`/registry/${fundCode}/${baseYearMonth}/content`);
  return res.data;
}

export async function saveContent(fundCode: string, baseYearMonth: string, content: FundReportContent): Promise<void> {
  await client.put(`/registry/${fundCode}/${baseYearMonth}/content`, content);
}
