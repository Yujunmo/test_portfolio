from fastapi import APIRouter, Query

from app.models.schemas import MonthlyReportResponse
from app.services.report_service import get_monthly_report

router = APIRouter(prefix="/api/report", tags=["report"])


@router.get("/monthly", response_model=MonthlyReportResponse)
def monthly_report(
    company_code: str = Query(...),
    fund_code: str = Query(...),
    base_year_month: str = Query(...),
):
    return get_monthly_report(company_code, fund_code, base_year_month)
