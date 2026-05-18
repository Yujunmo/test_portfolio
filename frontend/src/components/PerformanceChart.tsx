import {
  CartesianGrid,
  ComposedChart,
  Bar,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BmPoint, NavPoint } from "../types";

interface Props {
  fundData: NavPoint[];
  bmData: BmPoint[];
  showFund: boolean;
  showBm: boolean;
  showExcess: boolean;
}

const COLORS = [
  "#2563eb", "#16a34a", "#dc2626", "#9333ea",
  "#ea580c", "#0891b2", "#65a30d", "#db2777",
];

export default function PerformanceChart({ fundData, bmData, showFund, showBm, showExcess }: Props) {
  // 날짜별로 데이터 집계
  const dateMap = new Map<string, Record<string, number>>();

  if (showFund || showExcess) {
    for (const p of fundData) {
      const existing = dateMap.get(p.date) ?? {};
      existing[`fund_${p.fund_code}`] = p.period_return;
      dateMap.set(p.date, existing);
    }
  }

  if (showBm || showExcess) {
    for (const p of bmData) {
      const existing = dateMap.get(p.date) ?? {};
      existing[`bm_${p.bm_code}`] = p.period_return;
      dateMap.set(p.date, existing);
    }
  }

  // excess: 펀드 1개 & BM 1개일 때만 계산
  const fundCodes = [...new Set(fundData.map((p) => p.fund_code))];
  const bmCodes = [...new Set(bmData.map((p) => p.bm_code))];
  const canShowExcess = showExcess && fundCodes.length === 1 && bmCodes.length === 1;

  if (canShowExcess) {
    for (const [date, row] of dateMap.entries()) {
      const fv = row[`fund_${fundCodes[0]}`];
      const bv = row[`bm_${bmCodes[0]}`];
      if (fv !== undefined && bv !== undefined) {
        row["excess"] = parseFloat((fv - bv).toFixed(2));
        dateMap.set(date, row);
      }
    }
  }

  const chartData = Array.from(dateMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, vals]) => ({ date, ...vals }));

  if (chartData.length === 0) return null;

  const fundNames = new Map(fundData.map((p) => [p.fund_code, p.fund_name]));
  const bmNames = new Map(bmData.map((p) => [p.bm_code, p.bm_name]));

  let colorIdx = 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">기간 수익률 추이</h3>
      <ResponsiveContainer width="100%" height={360}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            tickFormatter={(v: string) => v.slice(5)}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 11 }}
            tickFormatter={(v: number) => `${v}%`}
            width={55}
          />
          <Tooltip formatter={(v: number) => [`${v}%`]} />
          <Legend />

          {showFund &&
            fundCodes.map((code) => {
              const color = COLORS[colorIdx++ % COLORS.length];
              return (
                <Line
                  key={`fund_${code}`}
                  type="monotone"
                  dataKey={`fund_${code}`}
                  name={fundNames.get(code) ?? code}
                  stroke={color}
                  dot={false}
                  strokeWidth={2}
                />
              );
            })}

          {showBm &&
            bmCodes.map((code) => {
              const color = COLORS[colorIdx++ % COLORS.length];
              return (
                <Line
                  key={`bm_${code}`}
                  type="monotone"
                  dataKey={`bm_${code}`}
                  name={bmNames.get(code) ?? code}
                  stroke={color}
                  strokeDasharray="5 5"
                  dot={false}
                  strokeWidth={2}
                />
              );
            })}

          {canShowExcess && (
            <Bar
              dataKey="excess"
              name="초과수익률"
              fill="#ef4444"
              opacity={0.4}
              barSize={4}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
