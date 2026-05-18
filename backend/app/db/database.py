from pathlib import Path
from sqlalchemy import create_engine, text, bindparam
from sqlalchemy.engine import Engine

SQL_DIR = Path(__file__).parent.parent.parent / "sql"
DB_PATH = Path(__file__).parent.parent.parent / "data" / "bigs.db"

_engine: Engine | None = None


def get_engine() -> Engine:
    global _engine
    if _engine is None:
        _engine = create_engine(f"sqlite:///{DB_PATH}", echo=False)
    return _engine


def read_sql(relative_path: str) -> str:
    """sql/ 디렉터리 하위의 SQL 파일을 읽어 문자열로 반환한다."""
    sql_file = SQL_DIR / relative_path
    return sql_file.read_text(encoding="utf-8")


def execute_sql(
    relative_path: str,
    params: dict | None = None,
    expanding_keys: list[str] | None = None,
) -> list[dict]:
    """
    SQL 파일을 읽어 실행하고 결과를 dict 리스트로 반환한다.

    expanding_keys: IN 절에 사용할 리스트 파라미터 키 목록
    """
    sql_content = read_sql(relative_path)
    stmt = text(sql_content)

    if expanding_keys:
        bind_params = [bindparam(key, expanding=True) for key in expanding_keys]
        stmt = stmt.bindparams(*bind_params)

    with get_engine().connect() as conn:
        result = conn.execute(stmt, params or {})
        columns = list(result.keys())
        return [dict(zip(columns, row)) for row in result.fetchall()]
