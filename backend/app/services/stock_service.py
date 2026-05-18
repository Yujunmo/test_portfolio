from app.db.database import execute_sql
from app.models.schemas import StockHoldingRow


def get_stock_holdings(
    company_code: str,
    fund_code: str,
    base_date: str,
    stock_code: str = "",
) -> list[StockHoldingRow]:
    rows = execute_sql(
        "stock/get_stock_holdings.sql",
        params={
            "company_code": company_code,
            "fund_code":    fund_code,
            "base_date":    base_date,
            "stock_code":   stock_code,
        },
    )
    return [StockHoldingRow(**row) for row in rows]
