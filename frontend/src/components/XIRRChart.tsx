import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { NpvPoint } from "../types";

interface Props {
  data: NpvPoint[];
}

export default function XIRRChart({ data }: Props) {
  if (data.length === 0) return null;

  const chartData = data.map((p) => ({
    rate: (p.rate * 100).toFixed(2),
    npv: p.npv,
  }));

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">NPV 곡선 (할인율 vs 현재가치)</h3>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="rate"
            tick={{ fontSize: 11 }}
            tickFormatter={(v: string) => `${v}%`}
            label={{ value: "할인율 (%)", position: "insideBottom", offset: -2, fontSize: 11 }}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            tickFormatter={(v: number) => v.toLocaleString()}
            width={70}
            label={{ value: "현재가치", angle: -90, position: "insideLeft", fontSize: 11 }}
          />
          <Tooltip
            formatter={(v: number) => [v.toLocaleString(), "NPV"]}
            labelFormatter={(l: string) => `할인율: ${l}%`}
          />
          <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="4 4" />
          <Line
            type="monotone"
            dataKey="npv"
            stroke="#2563eb"
            dot={false}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
