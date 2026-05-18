from fastapi import APIRouter

from app.models.schemas import ReportContentBody, ReportRegistryItem
from app.services.registry_service import (
    add_registry,
    delete_registry,
    get_content,
    list_registry,
    save_content,
)

router = APIRouter(prefix="/api/registry", tags=["registry"])


@router.get("", response_model=list[ReportRegistryItem])
def get_registry():
    return list_registry()


@router.post("", status_code=201)
def post_registry(item: ReportRegistryItem):
    add_registry(item)
    return {"ok": True}


@router.delete("/{fund_code}/{base_year_month}", status_code=204)
def remove_registry(fund_code: str, base_year_month: str):
    delete_registry(fund_code, base_year_month)


@router.get("/{fund_code}/{base_year_month}/content", response_model=ReportContentBody)
def get_report_content(fund_code: str, base_year_month: str):
    return get_content(fund_code, base_year_month)


@router.put("/{fund_code}/{base_year_month}/content", status_code=200)
def put_report_content(fund_code: str, base_year_month: str, body: ReportContentBody):
    save_content(fund_code, base_year_month, body)
    return {"ok": True}
