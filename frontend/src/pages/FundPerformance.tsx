import { useEffect, useState } from "react";
import { fetchBmChart, fetchNavChart, fetchReturns } from "../api/performanceApi";
import { fetchFunds } from "../api/fundApi";
import PerformanceTable from "../components/PerformanceTable";
import PerformanceChart from "../components/PerformanceChart";
import type { BmPoint, FundInfo, NavPoint, PerformanceRow } from "../types";
import { BM_OPTIONS, PERIOD_OPTIONS } from "../types";

const today = new Date().toISOString().slice(0, 10);
const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

export default function FundPerformance() {
  const [funds, setFunds] = useState<FundInfo[]>([]);
  const [selectedFunds, setSelectedFunds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(oneMonthAgo);
  const [endDate, setEndDate] = useState(today);
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>([...PERIOD_OPTIONS]);
  const [selectedBms, setSelectedBms] = useState<string[]>([]);
  const [showFund, setShowFund] = useState(true);
  const [showBm, setShowBm] = useState(true);
  const [showExcess, setShowExcess] = useState(true);

  const [tableData, setTableData] = useState<PerformanceRow[]>([]);
  const [navData, setNavData] = useState<NavPoint[]>([]);
  const [bmData, setBmData] = useState<BmPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [bmLoading, setBmLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBm = async (codes: string[]) => {
    if (codes.length === 0) { setBmData([]); return; }
    if (navData.length === 0) return; // 펀드 조회가 선행돼야 함
    setBmLoading(true);
    try {
      const bm = await fetchBmChart({ bm_codes: codes, start_date: startDate, end_date: endDate });
      setBmData(bm);
    } catch {
      setError("BM 데이터 조회 중 오류가 발생했습니다.");
    } finally {
      setBmLoading(false);
    }
  };

  useEffect(() => {
    fetchFunds().then(setFunds).catch(() => setError("펀드 목록 조회 실패"));
  }, []);

  const toggleFund = (code: string) => {
    setSelectedFunds((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const togglePeriod = (p: string) => {
    setSelectedPeriods((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const toggleBm = (code: string) => {
    const next = selectedBms.includes(code)
      ? selectedBms.filter((c) => c !== code)
      : [...selectedBms, code];
    setSelectedBms(next);
    fetchBm(next);
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
      const [table, nav] = await Promise.all([
        fetchReturns({ fund_codes: selectedFunds, start_date: startDate, end_date: endDate, periods: selectedPeriods }),
        fetchNavChart({ fund_codes: selectedFunds, start_date: startDate, end_date: endDate }),
      ]);
      setTableData(table);
      setNavData(nav);
      setBmData([]);
      setSelectedBms([]);
    } catch {
      setError("데이터 조회 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">펀드별 성과분석</h2>

      {/* 검색 조건 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h3 className="text-base font-semibold text-gray-700">검색 조건</h3>

        {/* 펀드 선택 */}
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

        {/* 날짜 */}
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

        {/* 기간 체크박스 */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">비교 기간</label>
          <div className="flex flex-wrap gap-3">
            {PERIOD_OPTIONS.map((p) => (
              <label key={p} className="flex items-center gap-1.5 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={selectedPeriods.includes(p)}
                  onChange={() => togglePeriod(p)}
                  className="rounded text-primary-600"
                />
                {p}
              </label>
            ))}
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

      {/* 수익률 테이블 */}
      {tableData.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-gray-700">펀드별 수익률</h3>
          <PerformanceTable data={tableData} />
        </div>
      )}

      {/* 차트 섹션 */}
      {(navData.length > 0 || bmData.length > 0) && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="text-base font-semibold text-gray-700">수익률 그래프</h3>

          {/* BM 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              BM 지수
              {bmLoading && <span className="ml-2 text-xs text-gray-400">로딩 중...</span>}
            </label>
            <div className="flex flex-wrap gap-3">
              {BM_OPTIONS.map((bm) => (
                <label key={bm.value} className="flex items-center gap-1.5 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={selectedBms.includes(bm.value)}
                    onChange={() => toggleBm(bm.value)}
                    disabled={bmLoading || navData.length === 0}
                    className="rounded text-primary-600 disabled:opacity-40"
                  />
                  {bm.label}
                </label>
              ))}
            </div>
            {navData.length === 0 && (
              <p className="mt-1 text-xs text-gray-400">펀드 조회 후 선택 가능합니다.</p>
            )}
          </div>

          {/* 그래프 표시 옵션 */}
          <div className="flex gap-4">
            {[
              { label: "펀드 그래프", state: showFund, set: setShowFund },
              { label: "BM 그래프", state: showBm, set: setShowBm },
              { label: "초과수익률", state: showExcess, set: setShowExcess },
            ].map(({ label, state, set }) => (
              <label key={label} className="flex items-center gap-1.5 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={state}
                  onChange={() => set(!state)}
                  className="rounded text-primary-600"
                />
                {label}
              </label>
            ))}
          </div>

          <PerformanceChart
            fundData={navData}
            bmData={bmData}
            showFund={showFund}
            showBm={showBm}
            showExcess={showExcess}
          />
        </div>
      )}
    </div>
  );
}
