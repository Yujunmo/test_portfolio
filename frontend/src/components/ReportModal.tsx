import { useState } from "react";
import type { ReportFund, FundReportContent } from "../pages/MonthlyReport";

interface Props {
  fund: ReportFund;
  initialContent: FundReportContent;
  onSave: (content: FundReportContent) => void;
  onClose: () => void;
}

type Section = keyof FundReportContent;

const SECTIONS: { key: Section; label: string }[] = [
  { key: "fund_overview", label: "펀드" },
  { key: "holdings", label: "보유종목" },
  { key: "performance", label: "성과지표" },
  { key: "manager_comment", label: "운용역 코멘트" },
  { key: "market_analysis", label: "시장분석" },
];

export default function ReportModal({ fund, initialContent, onSave, onClose }: Props) {
  const [activeSection, setActiveSection] = useState<Section>("fund_overview");
  const [content, setContent] = useState<FundReportContent>(initialContent);

  const handleSave = () => {
    onSave(content);
    onClose();
  };

  const handleChange = (value: string) => {
    setContent((prev) => ({ ...prev, [activeSection]: value }));
  };

  const filledCount = SECTIONS.filter((s) => content[s.key].trim()).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-[780px] max-h-[85vh] flex flex-col overflow-hidden">

        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              {fund.fund_code} · {fund.fund_name}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              기준 연월: {fund.base_year_month} &nbsp;·&nbsp; {filledCount}/{SECTIONS.length} 항목 작성됨
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* 바디 */}
        <div className="flex flex-1 overflow-hidden">

          {/* 왼쪽 섹션 네비 */}
          <nav className="w-40 border-r border-gray-100 bg-gray-50 py-3 flex-shrink-0">
            {SECTIONS.map(({ key, label }) => {
              const filled = content[key].trim().length > 0;
              return (
                <button
                  key={key}
                  onClick={() => setActiveSection(key)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2 ${
                    activeSection === key
                      ? "bg-primary-50 text-primary-700 font-semibold border-r-2 border-primary-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      filled ? "bg-green-400" : "bg-gray-300"
                    }`}
                  />
                  {label}
                </button>
              );
            })}
          </nav>

          {/* 오른쪽 편집 영역 */}
          <div className="flex-1 flex flex-col p-5 overflow-auto">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {SECTIONS.find((s) => s.key === activeSection)?.label}
            </label>
            <textarea
              value={content[activeSection]}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={getPlaceholder(activeSection)}
              className="flex-1 min-h-[320px] w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 leading-relaxed"
            />
            <p className="text-xs text-gray-400 mt-1.5 text-right">
              {content[activeSection].length}자
            </p>
          </div>
        </div>

        {/* 푸터 */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

function getPlaceholder(section: Section): string {
  const map: Record<Section, string> = {
    fund_overview:    "펀드의 기본 정보, 운용 전략, 투자 목적 등을 입력하세요.",
    holdings:         "주요 보유 종목 현황, 비중, 변동 내역 등을 입력하세요.",
    performance:      "수익률, 벤치마크 대비 성과, 주요 지표 등을 입력하세요.",
    manager_comment:  "운용역의 이달 운용 코멘트 및 향후 전략을 입력하세요.",
    market_analysis:  "시장 환경 분석, 주요 이슈, 전망 등을 입력하세요.",
  };
  return map[section];
}
