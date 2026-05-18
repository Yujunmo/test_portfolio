import numpy as np
from scipy.optimize import newton

from app.db.database import execute_sql
from app.models.schemas import NpvPoint, XirrRow


def _xirr(cashflows: list[float], dates: list[str], guess: float = 0.1) -> float | None:
    from datetime import date as date_type
    date_objs = [date_type.fromisoformat(d) for d in dates]
    days = np.array([(d - date_objs[0]).days for d in date_objs], dtype=float)
    cf = np.array(cashflows, dtype=float)
    try:
        rate = newton(lambda r: np.sum(cf / (1 + r) ** (days / 365)), guess)
        return float(rate)
    except Exception:
        return None


def get_xirr(
    fund_codes: list[str],
    start_date: str,
    end_date: str,
) -> list[XirrRow]:
    rows = execute_sql(
        "xirr/get_cash_flow.sql",
        params={"fund_codes": fund_codes, "start_date": start_date, "end_date": end_date},
        expanding_keys=["fund_codes"],
    )

    rows_by_fund: dict[str, list] = {}
    for row in rows:
        rows_by_fund.setdefault(row["fund_code"], []).append(row)

    result = []
    for fund_code, fund_rows in rows_by_fund.items():
        fund_name = fund_rows[0]["fund_name"]
        cashflows = [r["cash_flow"] for r in fund_rows]
        dates = [r["date"] for r in fund_rows]
        rate = _xirr(cashflows, dates)
        xirr_pct = round(rate * 100, 2) if rate is not None else None
        result.append(XirrRow(fund_code=fund_code, fund_name=fund_name, xirr=xirr_pct))

    return result


def get_npv_curve(
    fund_code: str,
    start_date: str,
    end_date: str,
    max_rate: float = 0.5,
    points: int = 200,
) -> list[NpvPoint]:
    rows = execute_sql(
        "xirr/get_cash_flow.sql",
        params={"fund_codes": [fund_code], "start_date": start_date, "end_date": end_date},
        expanding_keys=["fund_codes"],
    )

    if not rows:
        return []

    from datetime import date as date_type
    date_objs = [date_type.fromisoformat(r["date"]) for r in rows]
    days = np.array([(d - date_objs[0]).days for d in date_objs], dtype=float)
    cf = np.array([r["cash_flow"] for r in rows], dtype=float)

    rates = np.linspace(0.0001, max_rate, points)
    result = []
    for r in rates:
        npv = float(np.sum(cf / (1 + r) ** (days / 365)))
        result.append(NpvPoint(rate=round(float(r), 6), npv=round(npv, 2)))

    return result
