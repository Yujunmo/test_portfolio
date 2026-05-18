import type { XirrRow } from "../types";

interface Props {
  data: XirrRow[];
}

export default function XIRRTable({ data }: Props) {
  if (data.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">펀드코드</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">펀드명</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-600">내부수익률(%)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((row) => (
            <tr key={row.fund_code} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-mono text-gray-700">{row.fund_code}</td>
              <td className="px-4 py-3 text-gray-900">{row.fund_name}</td>
              <td
                className={`px-4 py-3 text-right font-medium ${
                  row.xirr === null ? "text-gray-400" :
                  row.xirr > 0 ? "text-red-600" : "text-blue-600"
                }`}
              >
                {row.xirr !== null ? `${row.xirr}%` : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
