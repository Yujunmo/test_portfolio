import client from "./client";
import type { StockHoldingRow } from "../types";

interface StockHoldingsParams {
  company_code: string;
  fund_code: string;
  base_date: string;
  stock_code?: string;
}

export async function fetchStockHoldings(params: StockHoldingsParams): Promise<StockHoldingRow[]> {
  const res = await client.get<StockHoldingRow[]>("/stock/holdings", { params });
  return res.data;
}
