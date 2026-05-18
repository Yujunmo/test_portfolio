from pydantic import BaseModel


class FundInfo(BaseModel):
    fund_code: str
    fund_name: str
    company_code: str


class NavPoint(BaseModel):
    fund_code: str
    fund_name: str
    date: str
    period_return: float


class PerformanceRow(BaseModel):
    fund_code: str
    fund_name: str
    returns: dict[str, float | None]


class XirrRow(BaseModel):
    fund_code: str
    fund_name: str
    xirr: float | None


class NpvPoint(BaseModel):
    rate: float
    npv: float


class BmPoint(BaseModel):
    bm_code: str
    bm_name: str
    date: str
    period_return: float


class ReportRegistryItem(BaseModel):
    company_code: str
    fund_code: str
    fund_name: str
    base_year_month: str


class ReportContentBody(BaseModel):
    fund_overview: str = ""
    holdings: str = ""
    performance: str = ""
    manager_comment: str = ""
    market_analysis: str = ""


class FundReportInfo(BaseModel):
    fund_code: str
    fund_name: str
    company_code: str
    manager_name: str
    inception_date: str
    fund_type: str
    bm_name: str
    base_date: str
    inception_nav: float
    base_nav: float
    net_assets: int


class HoldingTop10Row(BaseModel):
    stock_code: str
    stock_name: str
    sector: str
    holding_qty: int
    avg_buy_price: int
    current_price: int
    eval_amount: int
    weight_pct: float
    stock_return_pct: float
    contribution_pct: float


class SectorWeightRow(BaseModel):
    sector: str
    eval_amount: int
    weight_pct: float


class NavSeriesPoint(BaseModel):
    date: str
    cumulative_return: float


class MonthlyReportResponse(BaseModel):
    fund_info: FundReportInfo
    period_returns: PerformanceRow
    nav_series: list[NavSeriesPoint]
    holdings_top10: list[HoldingTop10Row]
    sector_weights: list[SectorWeightRow]


class StockHoldingRow(BaseModel):
    fund_code: str
    fund_name: str
    stock_code: str
    stock_name: str
    date: str
    holding_qty: int
    avg_buy_price: int
    current_price: int
    eval_amount: int
    buy_amount: int
    eval_profit: int
    return_pct: float
    vs_prev_day: int | None
    vs_prev_day_pct: float | None
