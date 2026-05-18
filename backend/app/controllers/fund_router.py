from fastapi import APIRouter

from app.db.database import execute_sql
from app.models.schemas import FundInfo

router = APIRouter(prefix="/api/funds", tags=["funds"])


@router.get("", response_model=list[FundInfo])
def get_funds():
    rows = execute_sql("fund/get_funds.sql")
    return [FundInfo(**row) for row in rows]
