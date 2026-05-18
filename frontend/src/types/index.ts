export interface FundInfo {
  fund_code: string;
  fund_name: string;
  company_code: string;
}

export interface PerformanceRow {
  fund_code: string;
  fund_name: string;
  returns: Record<string, number | null>;
}

export interface NavPoint {
  fund_code: string;
  fund_name: string;
  date: string;
  period_return: number;
}

export interface BmPoint {
  bm_code: string;
  bm_name: string;
  date: string;
  period_return: number;
}

export interface XirrRow {
  fund_code: string;
  fund_name: string;
  xirr: number | null;
}

export interface NpvPoint {
  rate: number;
  npv: number;
}

export interface FundReportInfo {
  fund_code: string;
  fund_name: string;
  company_code: string;
  manager_name: string;
  inception_date: string;
  fund_type: string;
  bm_name: string;
  base_date: string;
  inception_nav: number;
  base_nav: number;
  net_assets: number;
}

export interface HoldingTop10Row {
  stock_code: string;
  stock_name: string;
  sector: string;
  holding_qty: number;
  avg_buy_price: number;
  current_price: number;
  eval_amount: number;
  weight_pct: number;
  stock_return_pct: number;
  contribution_pct: number;
}

export interface SectorWeightRow {
  sector: string;
  eval_amount: number;
  weight_pct: number;
}

export interface NavSeriesPoint {
  date: string;
  cumulative_return: number;
}

export interface MonthlyReportResponse {
  fund_info: FundReportInfo;
  period_returns: PerformanceRow;
  nav_series: NavSeriesPoint[];
  holdings_top10: HoldingTop10Row[];
  sector_weights: SectorWeightRow[];
}

export const BM_OPTIONS = [
  { label: "코스피", value: "^KS11" },
  { label: "코스닥", value: "^KQ11" },
  { label: "S&P 500", value: "^GSPC" },
  { label: "나스닥", value: "^IXIC" },
] as const;

export interface StockHoldingRow {
  fund_code: string;
  fund_name: string;
  stock_code: string;
  stock_name: string;
  date: string;
  holding_qty: number;
  avg_buy_price: number;
  current_price: number;
  eval_amount: number;
  buy_amount: number;
  eval_profit: number;
  return_pct: number;
  vs_prev_day: number | null;
  vs_prev_day_pct: number | null;
}

export const PERIOD_OPTIONS = [
  "조회기간",
  "1일",
  "1주",
  "1개월",
  "3개월",
  "6개월",
  "1년",
] as const;
