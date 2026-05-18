import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import FundPerformance from "./pages/FundPerformance";
import MonthlyReport from "./pages/MonthlyReport";
import StockHoldings from "./pages/StockHoldings";
import XIRR from "./pages/XIRR";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/performance" replace />} />
          <Route path="/performance" element={<FundPerformance />} />
          <Route path="/xirr" element={<XIRR />} />
          <Route path="/stock-holdings" element={<StockHoldings />} />
          <Route path="/monthly-report" element={<MonthlyReport />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
