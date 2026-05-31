import { NavLink } from "react-router-dom";

const menu = [
  { path: "/performance", label: "펀드별 성과분석" },
  { path: "/xirr", label: "내부수익률" },
  { path: "/stock-holdings", label: "주식 보유현황" },
  { path: "/monthly-report", label: "월별 성과보고서" },
];

export default function Sidebar() {
  return (
    <aside className="w-56 min-h-screen bg-gray-800 text-white flex flex-col">
      <div className="px-6 py-5 border-b border-gray-700">
        <h1 className="text-lg font-bold tracking-wide">AITAS</h1>
        <p className="text-xs text-gray-400 mt-0.5">펀드 관리 시스템</p>
      </div>
      <nav className="flex-1 px-3 py-4">
        <p className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          성과분석
        </p>
        <ul className="space-y-1">
          {menu.map(({ path, label }) => (
            <li key={path}>
              <NavLink
                to={path}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary-600 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
