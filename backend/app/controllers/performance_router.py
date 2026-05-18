from fastapi import APIRouter, Query

from app.models.schemas import BmPoint, NavPoint, PerformanceRow
from app.services.performance_service import (
    get_bm_chart_data,
    get_nav_chart_data,
    get_performance_returns,
)

router = APIRouter(prefix="/api/performance", tags=["performance"])

ALL_PERIODS = ["조회기간", "1일", "1주", "1개월", "3개월", "6개월", "1년"]


@router.get("/returns", response_model=list[PerformanceRow])
def returns(
    fund_codes: list[str] = Query(...),
    start_date: str = Query(...),
    end_date: str = Query(...),
    periods: list[str] = Query(default=ALL_PERIODS),
):
    return get_performance_returns(fund_codes, start_date, end_date, periods)


@router.get("/nav", response_model=list[NavPoint])
def nav_chart(
    fund_codes: list[str] = Query(...),
    start_date: str = Query(...),
    end_date: str = Query(...),
):
    return get_nav_chart_data(fund_codes, start_date, end_date)


@router.get("/bm", response_model=list[BmPoint])
def bm_chart(
    bm_codes: list[str] = Query(...),
    start_date: str = Query(...),
    end_date: str = Query(...),
):
    return get_bm_chart_data(bm_codes, start_date, end_date)
