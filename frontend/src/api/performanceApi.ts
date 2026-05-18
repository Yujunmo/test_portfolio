import client from "./client";
import type { BmPoint, NavPoint, PerformanceRow } from "../types";

interface ReturnsParams {
  fund_codes: string[];
  start_date: string;
  end_date: string;
  periods: string[];
}

export async function fetchReturns(params: ReturnsParams): Promise<PerformanceRow[]> {
  const res = await client.get<PerformanceRow[]>("/performance/returns", {
    params: {
      fund_codes: params.fund_codes,
      start_date: params.start_date,
      end_date: params.end_date,
      periods: params.periods,
    },
    paramsSerializer: (p) => {
      const parts: string[] = [];
      for (const [key, val] of Object.entries(p)) {
        if (Array.isArray(val)) {
          val.forEach((v) => parts.push(`${key}=${encodeURIComponent(v)}`));
        } else {
          parts.push(`${key}=${encodeURIComponent(val as string)}`);
        }
      }
      return parts.join("&");
    },
  });
  return res.data;
}

interface ChartParams {
  fund_codes: string[];
  start_date: string;
  end_date: string;
}

export async function fetchNavChart(params: ChartParams): Promise<NavPoint[]> {
  const res = await client.get<NavPoint[]>("/performance/nav", {
    params,
    paramsSerializer: (p) => {
      const parts: string[] = [];
      for (const [key, val] of Object.entries(p)) {
        if (Array.isArray(val)) {
          val.forEach((v) => parts.push(`${key}=${encodeURIComponent(v)}`));
        } else {
          parts.push(`${key}=${encodeURIComponent(val as string)}`);
        }
      }
      return parts.join("&");
    },
  });
  return res.data;
}

interface BmParams {
  bm_codes: string[];
  start_date: string;
  end_date: string;
}

export async function fetchBmChart(params: BmParams): Promise<BmPoint[]> {
  const res = await client.get<BmPoint[]>("/performance/bm", {
    params,
    paramsSerializer: (p) => {
      const parts: string[] = [];
      for (const [key, val] of Object.entries(p)) {
        if (Array.isArray(val)) {
          val.forEach((v) => parts.push(`${key}=${encodeURIComponent(v)}`));
        } else {
          parts.push(`${key}=${encodeURIComponent(val as string)}`);
        }
      }
      return parts.join("&");
    },
  });
  return res.data;
}
