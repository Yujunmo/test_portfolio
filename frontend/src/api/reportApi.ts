import client from "./client";
import type { MonthlyReportResponse } from "../types";

interface ReportParams {
  company_code: string;
  fund_code: string;
  base_year_month: string;
}

export async function fetchMonthlyReport(params: ReportParams): Promise<MonthlyReportResponse> {
  const res = await client.get<MonthlyReportResponse>("/report/monthly", { params });
  return res.data;
}
