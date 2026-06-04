import { useEffect, useState } from "react";
import { fetchFunds } from "../api/fundApi";
import { fetchStockHoldings } from "../api/stockApi";
import StockTable from "../components/StockTable";
import type { FundInfo, StockHoldingRow } from "../types";

const today = new Date().toISOString().slice(0, 10);

export default function StockHoldings() {
  const [funds, setFunds] = useState<FundInfo[]>([]);
  const [companyCode, setCompanyCode] = useState("");
  const [fundCode, setFundCode] = useState("");
  const [baseDate, setBaseDate] = useState(today);
  const [stockCode, setStockCode] = useState("");

  const [tableData, setTableData] = useState<StockHoldingRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFunds().then(setFunds).catch(() => setError("펀드 목록 조회 실패"));
  }, []);

  // 펀드 선택 시 운용사코드 자동 설정
  const handleFundChange = (code: string) => {
    setFundCode(code);
    const fund = funds.find((f) => f.fund_code === code);
    if (fund) setCompanyCode(fund.company_code);
  };

  const handleSearch = async () => {
    if (!companyCode || !fundCode) {
      setError("운용사코드와 펀드코드를 선택하세요.");
      return;
    }
    if (!baseDate) {
      setError("기준일자를 입력하세요.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const data = await fetchStockHoldings({
        company_code: companyCode,
        fund_code: fundCode,
        base_date: baseDate,
        stock_code: stockCode || undefined,
      });
      setTableData(data);
      if (data.length === 0) setError("조회된 데이터가 없습니다.");
    } catch {
      setError("데이터 조회 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">주식 보유현황</h2>

      {/* 검색 조건 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h3 className="text-base font-semibold text-gray-700">검색 조건</h3>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {/* 펀드 선택 */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-1">펀드 선택</label>
            <select
              value={fundCode}
              onChange={(e) => handleFundChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">-- 펀드 선택 --</option>
              {funds.map((f) => (
                <option key={f.fund_code} value={f.fund_code}>
                  [{f.company_code}] {f.fund_code} {f.fund_name}
                </option>
              ))}
            </select>
          </div>

          {/* 운용사코드 (자동입력) */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">운용사코드</label>
            <input
              type="text"
              value={companyCode}
              onChange={(e) => setCompanyCode(e.target.value)}
              placeholder="03069"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* 기준일자 */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">기준일자</label>
            <input
              type="date"
              value={baseDate}
              onChange={(e) => setBaseDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* 종목코드 (선택) */}
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              종목코드 <span className="text-gray-400 font-normal">(선택)</span>
            </label>
            <input
              type="text"
              value={stockCode}
              onChange={(e) => setStockCode(e.target.value)}
              placeholder="005930 (전체 조회시 공란)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-6 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "조회 중..." : "조회"}
        </button>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      {/* 조회 결과 */}
      {tableData.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-700">
              보유 종목 현황
            </h3>
            <span className="text-sm text-gray-500">
              {tableData[0].fund_code} {tableData[0].fund_name} &nbsp;·&nbsp; 기준일: {tableData[0].date}
            </span>
          </div>
          <StockTable data={tableData} />
        </div>
      )}
    </div>
  );
}
