import { useEffect, useState } from "react";
import { fetchFunds } from "../api/fundApi";
import { fetchNpvCurve, fetchXirr } from "../api/xirrApi";
import XIRRTable from "../components/XIRRTable";
import XIRRChart from "../components/XIRRChart";
import type { FundInfo, NpvPoint, XirrRow } from "../types";

const today = new Date().toISOString().slice(0, 10);
const startDefault = "2020-01-01";

export default function XIRR() {
  const [funds, setFunds] = useState<FundInfo[]>([]);
  const [selectedFunds, setSelectedFunds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(startDefault);
  const [endDate, setEndDate] = useState(today);

  const [chartFund, setChartFund] = useState("");
  const [maxRate, setMaxRate] = useState(0.5);

  const [xirrData, setXirrData] = useState<XirrRow[]>([]);
  const [npvData, setNpvData] = useState<NpvPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFunds().then(setFunds).catch(() => setError("펀드 목록 조회 실패"));
  }, []);

  const toggleFund = (code: string) => {
    setSelectedFunds((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleSearch = async () => {
    if (selectedFunds.length === 0) {
      setError("펀드를 1개 이상 선택하세요.");
      return;
    }
    if (startDate > endDate) {
      setError("시작일자가 끝일자보다 클 수 없습니다.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const data = await fetchXirr({ fund_codes: selectedFunds, start_date: startDate, end_date: endDate });
      setXirrData(data);
      setNpvData([]);
    } catch {
      setError("데이터 조회 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleChartSearch = async () => {
    if (!chartFund) {
      setError("차트용 펀드를 선택하세요.");
      return;
    }
    setError(null);
    setChartLoading(true);
    try {
      const data = await fetchNpvCurve({
        fund_code: chartFund,
        start_date: startDate,
        end_date: endDate,
        max_rate: maxRate,
      });
      setNpvData(data);
    } catch {
      setError("NPV 데이터 조회 중 오류가 발생했습니다.");
    } finally {
      setChartLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">내부수익률 (XIRR)</h2>

      {/* 검색 조건 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h3 className="text-base font-semibold text-gray-700">검색 조건</h3>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">펀드 선택</label>
          <div className="flex flex-wrap gap-2">
            {funds.map((f) => (
              <button
                key={f.fund_code}
                onClick={() => toggleFund(f.fund_code)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  selectedFunds.includes(f.fund_code)
                    ? "bg-primary-600 text-white border-primary-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-primary-500"
                }`}
              >
                {f.fund_code} {f.fund_name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4 flex-wrap">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">시작일자</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">끝일자</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-6 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "계산 중..." : "내부수익률 계산"}
        </button>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      {/* XIRR 테이블 */}
      {xirrData.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-gray-700">내부수익률 결과</h3>
          <XIRRTable data={xirrData} />
        </div>
      )}

      {/* NPV 차트 섹션 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h3 className="text-base font-semibold text-gray-700">NPV 곡선 분석</h3>
        <div className="flex gap-4 flex-wrap items-end">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">펀드 선택 (단일)</label>
            <select
              value={chartFund}
              onChange={(e) => setChartFund(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">-- 선택 --</option>
              {funds.map((f) => (
                <option key={f.fund_code} value={f.fund_code}>
                  {f.fund_code} {f.fund_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">최대 할인율</label>
            <input
              type="number"
              value={maxRate}
              onChange={(e) => setMaxRate(parseFloat(e.target.value))}
              step={0.05}
              min={0.05}
              max={2}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            onClick={handleChartSearch}
            disabled={chartLoading}
            className="px-5 py-2 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {chartLoading ? "로딩..." : "차트 조회"}
          </button>
        </div>

        {npvData.length > 0 && <XIRRChart data={npvData} />}
      </div>
    </div>
  );
}
