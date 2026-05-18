import client from "./client";
import type { FundInfo } from "../types";

export async function fetchFunds(): Promise<FundInfo[]> {
  const res = await client.get<FundInfo[]>("/funds");
  return res.data;
}
