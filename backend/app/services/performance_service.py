from app.db.database import execute_sql
from app.models.schemas import BmPoint, NavPoint, PerformanceRow

BM_NAME_MAP = {
    "^KS11": "코스피",
    "^KQ11": "코스닥",
    "^GSPC": "S&P 500",
    "^IXIC": "나스닥",
}

# SQL 컬럼명 → 표시 레이블 (날짜는 런타임에 치환)
PERIOD_COLUMN_MAP = {
    "return_period": ("조회기간", "period_start_date"),
    "return_1d":     ("1일",     "date_1d"),
    "return_1w":     ("1주",     "date_1w"),
    "return_1m":     ("1개월",   "date_1m"),
    "return_3m":     ("3개월",   "date_3m"),
    "return_6m":     ("6개월",   "date_6m"),
    "return_1y":     ("1년",     "date_1y"),
}


def get_performance_returns(
    fund_codes: list[str],
    start_date: str,
    end_date: str,
    periods: list[str],
) -> list[PerformanceRow]:
    """
    SQL에서 모든 기간 수익률을 계산한 뒤,
    요청된 periods에 해당하는 컬럼만 골라 반환한다.
    """
    rows = execute_sql(
        "performance/get_period_returns.sql",
        params={"fund_codes": fund_codes, "start_date": start_date, "end_date": end_date},
        expanding_keys=["fund_codes"],
    )

    result = []
    for row in rows:
        returns: dict[str, float | None] = {}
        for col, (period_name, date_col) in PERIOD_COLUMN_MAP.items():
            if period_name not in periods:
                continue
            label = f"{period_name}({row[date_col]})"
            returns[label] = row[col]
        result.append(
            PerformanceRow(fund_code=row["fund_code"], fund_name=row["fund_name"], returns=returns)
        )

    return result


def get_nav_chart_data(
    fund_codes: list[str],
    start_date: str,
    end_date: str,
) -> list[NavPoint]:
    """차트용 펀드 기간수익률 시계열을 반환한다. (기준 수익률 계산은 SQL에서 처리)"""
    rows = execute_sql(
        "performance/get_nav_data.sql",
        params={"fund_codes": fund_codes, "start_date": start_date, "end_date": end_date},
        expanding_keys=["fund_codes"],
    )

    base_nav: dict[str, float] = {}
    result = []
    for row in rows:
        fc = row["fund_code"]
        if fc not in base_nav:
            base_nav[fc] = row["adj_nav"]
        period_return = round((row["adj_nav"] / base_nav[fc] - 1) * 100, 2)
        result.append(
            NavPoint(
                fund_code=fc,
                fund_name=row["fund_name"],
                date=row["date"],
                period_return=period_return,
            )
        )

    return result


def get_bm_chart_data(
    bm_codes: list[str],
    start_date: str,
    end_date: str,
) -> list[BmPoint]:
    """yfinance에서 BM 지수 데이터를 가져와 기간수익률로 변환한다."""
    import yfinance as yf

    result = []
    for bm_code in bm_codes:
        hist = yf.Ticker(bm_code).history(start=start_date, end=end_date).reset_index()
        if hist.empty:
            continue
        hist["Date"] = hist["Date"].dt.strftime("%Y-%m-%d")
        base_close = hist["Close"].iloc[0]
        bm_name = BM_NAME_MAP.get(bm_code, bm_code)
        for _, row in hist.iterrows():
            result.append(
                BmPoint(
                    bm_code=bm_code,
                    bm_name=bm_name,
                    date=row["Date"],
                    period_return=round((row["Close"] / base_close - 1) * 100, 2),
                )
            )

    return result
