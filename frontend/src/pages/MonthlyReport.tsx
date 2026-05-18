import { useEffect, useState } from "react";
import { fetchFunds } from "../api/fundApi";
import { addRegistry, fetchContent, fetchRegistry, removeRegistry, saveContent } from "../api/registryApi";
import { fetchMonthlyReport } from "../api/reportApi";
import FundReport from "../components/FundReport";
import ReportModal from "../components/ReportModal";
import type { FundInfo, MonthlyReportResponse } from "../types";

type Tab = "overview" | "report";

export interface ReportFund extends FundInfo {
  base_year_month: string;
}

export interface FundReportContent {
  fund_overview: string;
  holdings: string;
  performance: string;
  manager_comment: string;
  market_analysis: string;
}

const EMPTY_CONTENT: FundReportContent = {
  fund_overview:   "",
  holdings:        "",
  performance:     "",
  manager_comment: "",
  market_analysis: "",
};

const currentYearMonth = new Date().toISOString().slice(0, 7);

function contentKey(fund: ReportFund) {
  return `${fund.fund_code}__${fund.base_year_month}`;
}

function filledSections(content: FundReportContent) {
  return Object.values(content).filter((v) => v.trim()).length;
}

export default function MonthlyReport() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [funds, setFunds] = useState<FundInfo[]>([]);
  const [reportFunds, setReportFunds] = useState<ReportFund[]>([]);
  const [contentMap, setContentMap] = useState<Record<string, FundReportContent>>({});
  const [modalFund, setModalFund] = useState<ReportFund | null>(null);

  // 보고서 탭
  const [reportFund, setReportFund] = useState<ReportFund | null>(null);
  const [reportData, setReportData] = useState<MonthlyReportResponse | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const [selectedFundCode, setSelectedFundCode] = useState("");
  const [baseYearMonth, setBaseYearMonth] = useState(currentYearMonth);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchFunds().then(setFunds).catch(() => {});
    // 저장된 등록 목록 + 각 컨텐츠 불러오기
    fetchRegistry().then(async (items) => {
      const funds = items.map((i) => ({
        fund_code: i.fund_code,
        fund_name: i.fund_name,
        company_code: i.company_code,
        base_year_month: i.base_year_month,
      }));
      setReportFunds(funds);
      const entries = await Promise.all(
        funds.map(async (f) => {
          const content = await fetchContent(f.fund_code, f.base_year_month);
          return [contentKey(f), content] as const;
        })
      );
      setContentMap(Object.fromEntries(entries));
    }).catch(() => {});
  }, []);

  const handleAdd = async () => {
    if (!selectedFundCode) {
      setFormError("펀드를 선택하세요.");
      return;
    }
    const alreadyAdded = reportFunds.some(
      (f) => f.fund_code === selectedFundCode && f.base_year_month === baseYearMonth
    );
    if (alreadyAdded) {
      setFormError("이미 등록된 펀드·기준월 조합입니다.");
      return;
    }
    const fund = funds.find((f) => f.fund_code === selectedFundCode)!;
    const newFund: ReportFund = { ...fund, base_year_month: baseYearMonth };
    await addRegistry(newFund);
    setReportFunds((prev) => [...prev, newFund]);
    setSelectedFundCode("");
    setFormError(null);
  };

  const handleRemove = async (fundCode: string, yearMonth: string) => {
    await removeRegistry(fundCode, yearMonth);
    setReportFunds((prev) =>
      prev.filter((f) => !(f.fund_code === fundCode && f.base_year_month === yearMonth))
    );
  };

  const handleSaveContent = async (fund: ReportFund, content: FundReportContent) => {
    await saveContent(fund.fund_code, fund.base_year_month, content);
    setContentMap((prev) => ({ ...prev, [contentKey(fund)]: content }));
  };

  const handleOpenReport = async (fund: ReportFund) => {
    setActiveTab("report");
    setReportFund(fund);
    setReportData(null);
    setReportError(null);
    setReportLoading(true);
    try {
      const data = await fetchMonthlyReport({
        company_code: fund.company_code,
        fund_code: fund.fund_code,
        base_year_month: fund.base_year_month,
      });
      setReportData(data);
    } catch {
      setReportError("보고서 데이터 조회에 실패했습니다.");
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">펀드별 월별 성과보고서</h2>

      {/* 탭 */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1">
          {(
            [
              { key: "overview", label: "펀드 개요" },
              { key: "report",   label: "보고서" },
            ] as { key: Tab; label: string }[]
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === key
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* 펀드 개요 탭 */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* 등록 폼 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h3 className="text-base font-semibold text-gray-700">보고 펀드 등록</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">펀드 선택</label>
                <select
                  value={selectedFundCode}
                  onChange={(e) => setSelectedFundCode(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">-- 펀드 선택 --</option>
                  {funds.map((f) => (
                    <option key={f.fund_code} value={f.fund_code}>
                      {f.fund_code} {f.fund_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">기준 연월</label>
                <input
                  type="month"
                  value={baseYearMonth}
                  onChange={(e) => setBaseYearMonth(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <button
              onClick={handleAdd}
              className="px-5 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              + 등록
            </button>
          </div>

          {/* 등록된 펀드 목록 */}
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-gray-700">
              등록된 보고 펀드
              <span className="ml-2 text-sm font-normal text-gray-400">({reportFunds.length}건)</span>
            </h3>

            {reportFunds.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-sm text-gray-400">
                등록된 펀드가 없습니다. 위 폼에서 펀드를 등록하세요.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wide">
                    <tr>
                      <th className="px-4 py-3 text-left">운용사코드</th>
                      <th className="px-4 py-3 text-left">펀드코드</th>
                      <th className="px-4 py-3 text-left">펀드명</th>
                      <th className="px-4 py-3 text-left">기준 연월</th>
                      <th className="px-4 py-3 text-center">작성 현황</th>
                      <th className="px-4 py-3 text-center">내용 작성</th>
                      <th className="px-4 py-3 text-center">삭제</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reportFunds.map((f) => {
                      const content = contentMap[contentKey(f)] ?? EMPTY_CONTENT;
                      const filled = filledSections(content);
                      return (
                        <tr
                          key={contentKey(f)}
                          className="hover:bg-blue-50 cursor-pointer"
                          onDoubleClick={() => handleOpenReport(f)}
                          title="더블클릭하면 보고서 화면으로 이동합니다"
                        >
                          <td className="px-4 py-3 text-gray-500">{f.company_code}</td>
                          <td className="px-4 py-3 font-mono text-gray-700">{f.fund_code}</td>
                          <td className="px-4 py-3 font-medium text-gray-900">{f.fund_name}</td>
                          <td className="px-4 py-3 text-gray-700">{f.base_year_month}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-xs font-medium ${filled === 5 ? "text-green-600" : filled > 0 ? "text-yellow-600" : "text-gray-400"}`}>
                              {filled}/5
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => setModalFund(f)}
                              className="text-xs text-primary-600 hover:text-primary-800 hover:underline font-medium"
                            >
                              작성
                            </button>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleRemove(f.fund_code, f.base_year_month)}
                              className="text-xs text-red-500 hover:text-red-700 hover:underline"
                            >
                              삭제
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 보고서 탭 */}
      {activeTab === "report" && (
        <>
          {!reportFund && (
            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-sm text-gray-400 space-y-2">
              <p className="text-4xl">📄</p>
              <p className="font-medium text-gray-500">보고서 화면</p>
              <p>펀드 개요 탭에서 펀드를 <strong>더블클릭</strong>하면 운용보고서가 표시됩니다.</p>
            </div>
          )}
          {reportLoading && (
            <div className="flex items-center justify-center py-20 text-sm text-gray-400">
              보고서 데이터를 불러오는 중...
            </div>
          )}
          {reportError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
              {reportError}
            </div>
          )}
          {reportData && reportFund && !reportLoading && (
            <FundReport
              report={reportData}
              fund={reportFund}
              content={contentMap[contentKey(reportFund)] ?? EMPTY_CONTENT}
            />
          )}
        </>
      )}

      {/* 보고서 작성 모달 */}
      {modalFund && (
        <ReportModal
          fund={modalFund}
          initialContent={contentMap[contentKey(modalFund)] ?? EMPTY_CONTENT}
          onSave={(content) => handleSaveContent(modalFund, content)}
          onClose={() => setModalFund(null)}
        />
      )}
    </div>
  );
}
