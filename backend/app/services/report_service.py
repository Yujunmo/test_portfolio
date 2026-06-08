from app.db.database import execute_sql
from app.models.schemas import (
    FundReportInfo,
    HoldingTop10Row,
    MonthlyReportResponse,
    NavSeriesPoint,
    PerformanceRow,
    SectorWeightRow,
)
from app.services.performance_service import get_performance_returns


def get_monthly_report(
    company_code: str,
    fund_code: str,
    base_year_month: str,
) -> MonthlyReportResponse:
    # 1. 펀드 기본 정보 + 기준일 계산
    info_rows = execute_sql(
        "report/get_fund_info.sql",
        params={"fund_code": fund_code, "base_year_month": base_year_month},
    )
    if not info_rows:
        raise ValueError(f"펀드 정보를 찾을 수 없습니다: {fund_code}")

    info = FundReportInfo(**info_rows[0])
    base_date = info.base_date

    # 2. 기간별 수익률 (설정 이후 포함)
    period_rows = get_performance_returns(
        fund_codes=[fund_code],
        start_date=info.inception_date,
        end_date=base_date,
        periods=["조회기간", "1개월", "3개월", "6개월", "1년"],
    )
    # "조회기간" 레이블을 "설정 이후"로 변환
    if period_rows:
        pr = period_rows[0]
        renamed: dict = {}
        for k, v in pr.returns.items():
            if k.startswith("조회기간"):
                renamed[f"설정 이후({info.inception_date})"] = v
            else:
                renamed[k] = v
        period_returns = PerformanceRow(
            fund_code=pr.fund_code, fund_name=pr.fund_name, returns=renamed
        )
    else:
        period_returns = PerformanceRow(fund_code=fund_code, fund_name="", returns={})

    # 3. 누적수익률 시계열 (설정일 ~ 기준일)
    nav_rows = execute_sql(
        "report/get_nav_series.sql",
        params={
            "fund_code": fund_code,
            "inception_date": info.inception_date,
            "base_date": base_date,
        },
    )
    base_nav = nav_rows[0]["adj_nav"] if nav_rows else 1.0
    nav_series = [
        NavSeriesPoint(
            date=r["date"],
            cumulative_return=round((r["adj_nav"] / base_nav - 1) * 100, 3),
        )
        for r in nav_rows
    ]

    # 4. TOP10 보유 종목
    top10_rows = execute_sql(
        "report/get_holdings_top10.sql",
        params={
            "company_code": company_code,
            "fund_code": fund_code,
            "base_date": base_date,
        },
    )
    holdings_top10 = [HoldingTop10Row(**r) for r in top10_rows]

    # 5. 업종별 비중
    sector_rows = execute_sql(
        "report/get_sector_weights.sql",
        params={
            "company_code": company_code,
            "fund_code": fund_code,
            "base_date": base_date,
        },
    )
    sector_weights = [SectorWeightRow(**r) for r in sector_rows]

    return MonthlyReportResponse(
        fund_info=info,
        period_returns=period_returns,
        nav_series=nav_series,
        holdings_top10=holdings_top10,
        sector_weights=sector_weights,
    )
