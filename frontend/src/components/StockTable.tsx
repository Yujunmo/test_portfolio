import type { StockHoldingRow } from "../types";

interface Props {
  data: StockHoldingRow[];
}

const fmt = (n: number) => n.toLocaleString("ko-KR");

function SignCell({ value, suffix = "" }: { value: number | null; suffix?: string }) {
  if (value === null || value === undefined) return <td className="px-4 py-3 text-right text-gray-400">-</td>;
  const cls = value > 0 ? "text-red-600" : value < 0 ? "text-blue-600" : "text-gray-700";
  const prefix = value > 0 ? "▲" : value < 0 ? "▼" : "";
  return (
    <td className={`px-4 py-3 text-right font-medium ${cls}`}>
      {prefix} {fmt(Math.abs(value))}{suffix}
    </td>
  );
}

export default function StockTable({ data }: Props) {
  if (data.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full text-sm whitespace-nowrap">
        <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wide">
          <tr>
            <th className="px-4 py-3 text-left">종목코드</th>
            <th className="px-4 py-3 text-left">종목명</th>
            <th className="px-4 py-3 text-right">보유수량</th>
            <th className="px-4 py-3 text-right">평균매입단가</th>
            <th className="px-4 py-3 text-right">현재가</th>
            <th className="px-4 py-3 text-right">전일대비</th>
            <th className="px-4 py-3 text-right">전일대비율</th>
            <th className="px-4 py-3 text-right">평가금액</th>
            <th className="px-4 py-3 text-right">매입금액</th>
            <th className="px-4 py-3 text-right">평가손익</th>
            <th className="px-4 py-3 text-right">수익률(%)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((row) => (
            <tr key={row.stock_code} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-mono text-gray-700">{row.stock_code}</td>
              <td className="px-4 py-3 font-medium text-gray-900">{row.stock_name}</td>
              <td className="px-4 py-3 text-right text-gray-700">{fmt(row.holding_qty)}</td>
              <td className="px-4 py-3 text-right text-gray-700">{fmt(row.avg_buy_price)}</td>
              <td className="px-4 py-3 text-right font-semibold text-gray-900">{fmt(row.current_price)}</td>
              <SignCell value={row.vs_prev_day} />
              <SignCell value={row.vs_prev_day_pct} suffix="%" />
              <td className="px-4 py-3 text-right text-gray-700">{fmt(row.eval_amount)}</td>
              <td className="px-4 py-3 text-right text-gray-700">{fmt(row.buy_amount)}</td>
              <SignCell value={row.eval_profit} />
              <SignCell value={row.return_pct} suffix="%" />
            </tr>
          ))}
        </tbody>
        {data.length > 1 && (
          <tfoot className="bg-gray-50 border-t border-gray-200 text-xs font-semibold text-gray-600">
            <tr>
              <td className="px-4 py-3" colSpan={7}>합계</td>
              <td className="px-4 py-3 text-right">{fmt(data.reduce((s, r) => s + r.eval_amount, 0))}</td>
              <td className="px-4 py-3 text-right">{fmt(data.reduce((s, r) => s + r.buy_amount, 0))}</td>
              <td className="px-4 py-3 text-right">
                {(() => {
                  const total = data.reduce((s, r) => s + r.eval_profit, 0);
                  const cls = total > 0 ? "text-red-600" : total < 0 ? "text-blue-600" : "";
                  return <span className={cls}>{fmt(total)}</span>;
                })()}
              </td>
              <td className="px-4 py-3 text-right">
                {(() => {
                  const totalBuy = data.reduce((s, r) => s + r.buy_amount, 0);
                  const totalProfit = data.reduce((s, r) => s + r.eval_profit, 0);
                  const pct = totalBuy > 0 ? ((totalProfit / totalBuy) * 100).toFixed(2) : "-";
                  const cls = Number(pct) > 0 ? "text-red-600" : Number(pct) < 0 ? "text-blue-600" : "";
                  return <span className={cls}>{pct}%</span>;
                })()}
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
