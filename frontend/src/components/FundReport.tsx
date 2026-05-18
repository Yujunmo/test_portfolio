import {
  Area, AreaChart, Bar, BarChart, CartesianGrid,
  Cell, ReferenceLine, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import type { FundReportContent, ReportFund } from "../pages/MonthlyReport";
import type { MonthlyReportResponse } from "../types";

const fmt = (n: number) => n.toLocaleString("ko-KR");
const COLORS = ["#2563eb", "#16a34a", "#dc2626", "#9333ea", "#ea580c", "#0891b2"];

// ── 섹션 래퍼 ─────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

// ── 1. 펀드 기본 정보 ──────────────────────────────────
function FundBasicInfo({ data }: { data: MonthlyReportResponse["fund_info"] }) {
  const items = [
    { label: "펀드명",      value: data.fund_name },
    { label: "펀드코드",    value: data.fund_code },
    { label: "운용사",      value: data.company_code },
    { label: "운용역",      value: data.manager_name },
    { label: "기준일",      value: data.base_date },
    { label: "설정일",      value: data.inception_date },
    { label: "펀드 유형",   value: data.fund_type },
    { label: "벤치마크",    value: data.bm_name },
    { label: "기준가(원)",  value: fmt(Math.round(data.base_nav)) },
    { label: "순자산(원)",  value: fmt(data.net_assets) },
  ];
  return (
    <Section title="1. 펀드 기본 정보">
      <dl className="grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-4">
        {items.map(({ label, value }) => (
          <div key={label}>
            <dt className="text-xs text-gray-500 mb-0.5">{label}</dt>
            <dd className="text-sm font-semibold text-gray-900">{value}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}

// ── 2. 수익률 및 성과 ──────────────────────────────────
function PerformanceSection({ data }: { data: MonthlyReportResponse }) {
  const returns = data.period_returns.returns;

  // 누적수익률 차트용 데이터 (월말 값만 표시하여 포인트 수 줄임)
  const chartData = data.nav_series
    .filter((_, i) => i % 20 === 0 || i === data.nav_series.length - 1)
    .map((p) => ({ date: p.date.slice(0, 7), return: p.cumulative_return }));

  const latestReturn = data.nav_series.length > 0
    ? data.nav_series[data.nav_series.length - 1].cumulative_return
    : 0;

  return (
    <Section title="2. 수익률 및 성과">
      {/* 기간별 수익률 */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              {Object.keys(returns).map((k) => (
                <th key={k} className="pb-2 text-xs font-medium text-gray-500 text-right pr-6 whitespace-nowrap">
                  {k}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {Object.values(returns).map((v, i) => (
                <td key={i} className={`pt-2 text-right pr-6 font-bold text-base ${v === null ? "text-gray-400" : v > 0 ? "text-red-600" : "text-blue-600"}`}>
                  {v !== null ? `${v}%` : "-"}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* 누적수익률 그래프 */}
      <div>
        <p className="text-xs text-gray-500 mb-2">설정 이후 누적수익률 추이</p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="retGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} width={48} />
            <Tooltip formatter={(v: number) => [`${v}%`, "누적수익률"]} />
            <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="3 3" />
            <Area type="monotone" dataKey="return" stroke="#2563eb" fill="url(#retGrad)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 성과 요약 */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">설정 이후 누적수익률</p>
          <p className={`text-2xl font-bold ${latestReturn >= 0 ? "text-red-600" : "text-blue-600"}`}>
            {latestReturn >= 0 ? "▲" : "▼"} {Math.abs(latestReturn)}%
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">기준가</p>
          <p className="text-2xl font-bold text-gray-900">{fmt(Math.round(data.fund_info.base_nav))}원</p>
        </div>
      </div>
    </Section>
  );
}

// ── 3. 자산 구성 현황 ──────────────────────────────────
function AssetSection({ sectorWeights }: { sectorWeights: MonthlyReportResponse["sector_weights"] }) {
  const totalStockPct = sectorWeights.reduce((s, r) => s + r.weight_pct, 0);
  const assetData = [
    { name: "주식", value: Math.round(totalStockPct * 10) / 10 },
    { name: "현금·기타", value: Math.round((100 - totalStockPct) * 10) / 10 },
  ];

  return (
    <Section title="3. 자산 구성 현황">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 자산별 비중 */}
        <div>
          <p className="text-xs text-gray-500 mb-3">자산 유형별 비중</p>
          <div className="space-y-2">
            {assetData.map(({ name, value }, i) => (
              <div key={name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{name}</span>
                  <span className="font-semibold">{value}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${value}%`, backgroundColor: COLORS[i] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 업종별 비중 */}
        <div>
          <p className="text-xs text-gray-500 mb-2">업종별 비중</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={sectorWeights} layout="vertical" margin={{ left: 8, right: 24 }}>
              <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="sector" tick={{ fontSize: 11 }} width={72} />
              <Tooltip formatter={(v: number) => [`${v}%`, "비중"]} />
              <Bar dataKey="weight_pct" radius={[0, 3, 3, 0]}>
                {sectorWeights.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Section>
  );
}

// ── 4. 보유 종목 현황 ──────────────────────────────────
function HoldingsSection({ holdings }: { holdings: MonthlyReportResponse["holdings_top10"] }) {
  return (
    <Section title="4. 보유 종목 현황 (TOP 10)">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-xs text-gray-500 border-b border-gray-200">
            <tr>
              <th className="pb-2 text-left">종목코드</th>
              <th className="pb-2 text-left">종목명</th>
              <th className="pb-2 text-left">업종</th>
              <th className="pb-2 text-right">보유수량</th>
              <th className="pb-2 text-right">평가금액</th>
              <th className="pb-2 text-right">편입비중</th>
              <th className="pb-2 text-right">수익률</th>
              <th className="pb-2 text-right">기여도</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {holdings.map((h) => (
              <tr key={h.stock_code} className="hover:bg-gray-50">
                <td className="py-2 font-mono text-gray-600">{h.stock_code}</td>
                <td className="py-2 font-medium text-gray-900">{h.stock_name}</td>
                <td className="py-2 text-gray-500 text-xs">{h.sector}</td>
                <td className="py-2 text-right text-gray-700">{fmt(h.holding_qty)}</td>
                <td className="py-2 text-right text-gray-700">{fmt(h.eval_amount)}</td>
                <td className="py-2 text-right font-semibold">{h.weight_pct}%</td>
                <td className={`py-2 text-right font-medium ${h.stock_return_pct >= 0 ? "text-red-600" : "text-blue-600"}`}>
                  {h.stock_return_pct >= 0 ? "+" : ""}{h.stock_return_pct}%
                </td>
                <td className={`py-2 text-right font-medium ${h.contribution_pct >= 0 ? "text-red-600" : "text-blue-600"}`}>
                  {h.contribution_pct >= 0 ? "+" : ""}{h.contribution_pct}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

// ── 5. 운용역 코멘트 ───────────────────────────────────
function CommentSection({ content }: { content: FundReportContent }) {
  const sections = [
    { key: "fund_overview"   as const, label: "펀드" },
    { key: "holdings"        as const, label: "보유종목" },
    { key: "performance"     as const, label: "성과지표" },
    { key: "manager_comment" as const, label: "운용역 코멘트" },
    { key: "market_analysis" as const, label: "시장분석" },
  ];
  const filled = sections.filter((s) => content[s.key].trim());
  if (filled.length === 0) {
    return (
      <Section title="5. 운용역 코멘트">
        <p className="text-sm text-gray-400">작성된 코멘트가 없습니다. 펀드 개요 탭에서 내용을 입력하세요.</p>
      </Section>
    );
  }
  return (
    <Section title="5. 운용역 코멘트">
      <div className="space-y-4">
        {filled.map(({ key, label }) => (
          <div key={key}>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">{label}</p>
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-lg p-3">
              {content[key]}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ── 메인 컴포넌트 ──────────────────────────────────────
interface Props {
  report: MonthlyReportResponse;
  fund: ReportFund;
  content: FundReportContent;
}

export default function FundReport({ report, fund, content }: Props) {
  const handlePrint = () => {
    const title = `${report.fund_info.fund_name}_운용보고서_${fund.base_year_month}`;
    const prev = document.title;
    document.title = title;
    window.print();
    document.title = prev;
  };

  return (
    <div className="space-y-5">
      {/* 보고서 헤더 */}
      <div className="bg-primary-600 text-white rounded-xl px-6 py-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-primary-200 uppercase tracking-wider">Fund Management Report</p>
          <h2 className="text-xl font-bold mt-0.5">{report.fund_info.fund_name}</h2>
          <p className="text-sm text-primary-200 mt-0.5">
            {report.fund_info.fund_code} &nbsp;·&nbsp; {report.fund_info.fund_type} &nbsp;·&nbsp; BM: {report.fund_info.bm_name}
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs text-primary-200">기준 연월</p>
            <p className="text-2xl font-bold">{fund.base_year_month}</p>
            <p className="text-xs text-primary-200 mt-0.5">기준일: {report.fund_info.base_date}</p>
          </div>
          <button
            onClick={handlePrint}
            className="no-print flex items-center gap-1.5 bg-white/15 hover:bg-white/25 transition-colors text-white text-sm font-medium px-4 py-2 rounded-lg border border-white/30"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
            </svg>
            PDF 저장
          </button>
        </div>
      </div>

      <FundBasicInfo data={report.fund_info} />
      <PerformanceSection data={report} />
      <AssetSection sectorWeights={report.sector_weights} />
      <HoldingsSection holdings={report.holdings_top10} />
      <CommentSection content={content} />
    </div>
  );
}
