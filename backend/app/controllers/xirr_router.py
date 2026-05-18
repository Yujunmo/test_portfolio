from fastapi import APIRouter, Query

from app.models.schemas import NpvPoint, XirrRow
from app.services.xirr_service import get_npv_curve, get_xirr

router = APIRouter(prefix="/api/xirr", tags=["xirr"])


@router.get("/calculate", response_model=list[XirrRow])
def calculate(
    fund_codes: list[str] = Query(...),
    start_date: str = Query(...),
    end_date: str = Query(...),
):
    return get_xirr(fund_codes, start_date, end_date)


@router.get("/chart", response_model=list[NpvPoint])
def npv_curve(
    fund_code: str = Query(...),
    start_date: str = Query(...),
    end_date: str = Query(...),
    max_rate: float = Query(default=0.5),
):
    return get_npv_curve(fund_code, start_date, end_date, max_rate)
