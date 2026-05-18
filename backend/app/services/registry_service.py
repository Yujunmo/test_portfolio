from sqlalchemy import text

from app.db.database import execute_sql, get_engine
from app.models.schemas import ReportContentBody, ReportRegistryItem


def list_registry() -> list[ReportRegistryItem]:
    rows = execute_sql("registry/get_all.sql")
    return [ReportRegistryItem(**r) for r in rows]


def add_registry(item: ReportRegistryItem) -> None:
    with get_engine().begin() as conn:
        conn.execute(
            text("""
                INSERT OR IGNORE INTO report_registry
                    (company_code, fund_code, fund_name, base_year_month)
                VALUES
                    (:company_code, :fund_code, :fund_name, :base_year_month)
            """),
            item.model_dump(),
        )


def delete_registry(fund_code: str, base_year_month: str) -> None:
    with get_engine().begin() as conn:
        conn.execute(
            text("""
                DELETE FROM report_registry
                WHERE fund_code = :fund_code AND base_year_month = :base_year_month
            """),
            {"fund_code": fund_code, "base_year_month": base_year_month},
        )


def get_content(fund_code: str, base_year_month: str) -> ReportContentBody:
    rows = execute_sql(
        "registry/get_content.sql",
        params={"fund_code": fund_code, "base_year_month": base_year_month},
    )
    if rows:
        return ReportContentBody(**rows[0])
    return ReportContentBody()


def save_content(fund_code: str, base_year_month: str, body: ReportContentBody) -> None:
    with get_engine().begin() as conn:
        conn.execute(
            text("""
                INSERT INTO report_content
                    (fund_code, base_year_month, fund_overview, holdings,
                     performance, manager_comment, market_analysis)
                VALUES
                    (:fund_code, :base_year_month, :fund_overview, :holdings,
                     :performance, :manager_comment, :market_analysis)
                ON CONFLICT(fund_code, base_year_month) DO UPDATE SET
                    fund_overview   = excluded.fund_overview,
                    holdings        = excluded.holdings,
                    performance     = excluded.performance,
                    manager_comment = excluded.manager_comment,
                    market_analysis = excluded.market_analysis
            """),
            {
                "fund_code": fund_code,
                "base_year_month": base_year_month,
                **body.model_dump(),
            },
        )
