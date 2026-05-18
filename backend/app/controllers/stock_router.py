from fastapi import APIRouter, Query

from app.models.schemas import StockHoldingRow
from app.services.stock_service import get_stock_holdings

router = APIRouter(prefix="/api/stock", tags=["stock"])


@router.get("/holdings", response_model=list[StockHoldingRow])
def holdings(
    company_code: str = Query(...),
    fund_code: str = Query(...),
    base_date: str = Query(...),
    stock_code: str = Query(default=""),
):
    return get_stock_holdings(company_code, fund_code, base_date, stock_code)
