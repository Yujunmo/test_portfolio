import client from "./client";
import type { NpvPoint, XirrRow } from "../types";

interface XirrParams {
  fund_codes: string[];
  start_date: string;
  end_date: string;
}

export async function fetchXirr(params: XirrParams): Promise<XirrRow[]> {
  const res = await client.get<XirrRow[]>("/xirr/calculate", {
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

interface NpvParams {
  fund_code: string;
  start_date: string;
  end_date: string;
  max_rate?: number;
}

export async function fetchNpvCurve(params: NpvParams): Promise<NpvPoint[]> {
  const res = await client.get<NpvPoint[]>("/xirr/chart", { params });
  return res.data;
}
