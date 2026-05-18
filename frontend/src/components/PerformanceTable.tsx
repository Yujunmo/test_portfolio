import type { PerformanceRow } from "../types";

interface Props {
  data: PerformanceRow[];
}

export default function PerformanceTable({ data }: Props) {
  if (data.length === 0) return null;

  const periodKeys = Object.keys(data[0].returns);

  const colorClass = (val: number | null) => {
    if (val === null) return "";
    if (val > 0) return "text-red-600 font-medium";
    if (val < 0) return "text-blue-600 font-medium";
    return "";
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">펀드코드</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">펀드명</th>
            {periodKeys.map((k) => (
              <th key={k} className="px-4 py-3 text-right font-semibold text-gray-600 whitespace-nowrap">
                {k}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((row) => (
            <tr key={row.fund_code} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-mono text-gray-700">{row.fund_code}</td>
              <td className="px-4 py-3 text-gray-900">{row.fund_name}</td>
              {periodKeys.map((k) => {
                const val = row.returns[k];
                return (
                  <td key={k} className={`px-4 py-3 text-right ${colorClass(val)}`}>
                    {val !== null && val !== undefined ? `${val}%` : "-"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
