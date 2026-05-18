"""DB 초기화 및 샘플 데이터 생성 스크립트"""
import random
from datetime import date, timedelta

from sqlalchemy import text

from app.db.database import get_engine

FUNDS = [
    ("03069", "A0001", "삼성코리아주식펀드", "V0001"),
    ("03069", "A0002", "미래에셋성장주식펀드", "V0001"),
    ("04021", "B0001", "KB밸류채권혼합펀드", "V0002"),
]

# 종목코드, 종목명, 시작 종가, 변동성(σ), 일평균수익률(μ)
# 종목코드, 종목명, 시작 종가, 변동성(σ), 일평균수익률(μ), 업종
STOCKS = [
    ("005930", "삼성전자",    72000,  0.015, 0.0002, "반도체"),
    ("000660", "SK하이닉스", 155000,  0.020, 0.0003, "반도체"),
    ("005490", "POSCO홀딩스", 380000, 0.012, 0.0001, "철강/소재"),
    ("066570", "LG전자",       90000,  0.018, 0.0002, "전기전자"),
    ("035420", "NAVER",       210000,  0.022, 0.0003, "IT/인터넷"),
]

# 펀드 추가 정보: 운용역, 설정일, 펀드유형, BM명
FUND_INFO_DATA = {
    "A0001": ("김철수", "2018-03-15", "주식형",     "코스피"),
    "A0002": ("이영희", "2019-06-01", "주식형",     "코스피"),
    "B0001": ("박민준", "2020-01-10", "채권혼합형", "코스피"),
}

# 펀드별 보유 종목 (종목코드, 보유수량, 평균매입단가)
FUND_HOLDINGS = {
    "A0001": [
        ("005930", 10000, 68000),
        ("000660",  3000, 140000),
        ("005490",   500, 350000),
    ],
    "A0002": [
        ("000660",  2000, 145000),
        ("035420",  1500, 195000),
        ("066570",  4000,  85000),
    ],
    "B0001": [
        ("005930",  5000,  70000),
        ("005490",   300, 360000),
    ],
}


def _generate_nav_series(start_date: date, end_date: date, seed: int) -> list[tuple]:
    random.seed(seed)
    nav = 1000.0
    result = []
    current = start_date
    while current <= end_date:
        if current.weekday() < 5:
            daily_return = random.gauss(0.0003, 0.008)
            nav = round(nav * (1 + daily_return), 2)
            net_assets = int(nav * random.uniform(3000, 5000))
            result.append((current.isoformat(), nav, net_assets))
        current += timedelta(days=1)
    return result


def _generate_cash_flows(company_code: str, fund_code: str, fund_name: str) -> list[dict]:
    entries = [
        ("2020-01-01", -10000),
        ("2020-07-01", -2000),
        ("2021-01-01", -3000),
        ("2022-01-01", -5000),
        ("2023-01-01", -2000),
        ("2024-01-01", 1500),
        ("2025-01-01", 2000),
        ("2026-05-18", 25000),
    ]
    return [
        {"company_code": company_code, "fund_code": fund_code,
         "fund_name": fund_name, "date": d, "cash_flow": cf}
        for d, cf in entries
    ]


def _generate_stock_prices(start_date: date, end_date: date) -> dict[str, list[tuple]]:
    """종목별 일별 종가 시계열을 생성한다. {stock_code: [(date_str, close_price), ...]}"""
    result = {}
    for stock_code, _, base_price, sigma, mu, _sector in STOCKS:
        random.seed(hash(stock_code) % 10000)
        price = float(base_price)
        series = []
        current = start_date
        while current <= end_date:
            if current.weekday() < 5:
                daily_return = random.gauss(mu, sigma)
                price = round(price * (1 + daily_return) / 100) * 100  # 100원 단위
                price = max(price, base_price * 0.3)
                series.append((current.isoformat(), int(price)))
            current += timedelta(days=1)
        result[stock_code] = series
    return result


def _generate_stock_holdings(
    conn,
    stock_price_map: dict[str, list[tuple]],
) -> None:
    stock_info = {code: (name, sector) for code, name, _, _, _, sector in STOCKS}
    rows = []
    for (company_code, fund_code, fund_name, _) in FUNDS:
        holdings = FUND_HOLDINGS.get(fund_code, [])
        for stock_code, holding_qty, avg_buy_price in holdings:
            stock_name, sector = stock_info[stock_code]
            for date_str, close_price in stock_price_map[stock_code]:
                rows.append({
                    "company_code":  company_code,
                    "fund_code":     fund_code,
                    "fund_name":     fund_name,
                    "stock_code":    stock_code,
                    "stock_name":    stock_name,
                    "sector":        sector,
                    "date":          date_str,
                    "close_price":   close_price,
                    "holding_qty":   holding_qty,
                    "avg_buy_price": avg_buy_price,
                })

    conn.execute(
        text("""
            INSERT INTO tru_stck_ma
                (company_code, fund_code, fund_name, stock_code, stock_name, sector,
                 date, close_price, holding_qty, avg_buy_price)
            VALUES
                (:company_code, :fund_code, :fund_name, :stock_code, :stock_name, :sector,
                 :date, :close_price, :holding_qty, :avg_buy_price)
        """),
        rows,
    )


def init_db() -> None:
    engine = get_engine()

    with engine.begin() as conn:
        conn.execute(text("DROP TABLE IF EXISTS fund_nav"))
        conn.execute(text("DROP TABLE IF EXISTS fund_cash_flow"))
        conn.execute(text("DROP TABLE IF EXISTS tru_stck_ma"))
        conn.execute(text("DROP TABLE IF EXISTS fund_info"))
        conn.execute(text("DROP TABLE IF EXISTS report_registry"))
        conn.execute(text("DROP TABLE IF EXISTS report_content"))

        conn.execute(text("""
            CREATE TABLE fund_nav (
                id           INTEGER PRIMARY KEY AUTOINCREMENT,
                company_code TEXT NOT NULL,
                fund_code    TEXT NOT NULL,
                fund_name    TEXT NOT NULL,
                date         TEXT NOT NULL,
                adj_nav      REAL NOT NULL,
                net_assets   INTEGER NOT NULL,
                bm_code      TEXT
            )
        """))

        conn.execute(text("""
            CREATE TABLE fund_cash_flow (
                id           INTEGER PRIMARY KEY AUTOINCREMENT,
                company_code TEXT NOT NULL,
                fund_code    TEXT NOT NULL,
                fund_name    TEXT NOT NULL,
                date         TEXT NOT NULL,
                cash_flow    REAL NOT NULL
            )
        """))

        conn.execute(text("""
            CREATE TABLE report_registry (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                company_code    TEXT NOT NULL,
                fund_code       TEXT NOT NULL,
                fund_name       TEXT NOT NULL,
                base_year_month TEXT NOT NULL,
                UNIQUE(fund_code, base_year_month)
            )
        """))

        conn.execute(text("""
            CREATE TABLE report_content (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                fund_code       TEXT NOT NULL,
                base_year_month TEXT NOT NULL,
                fund_overview   TEXT NOT NULL DEFAULT '',
                holdings        TEXT NOT NULL DEFAULT '',
                performance     TEXT NOT NULL DEFAULT '',
                manager_comment TEXT NOT NULL DEFAULT '',
                market_analysis TEXT NOT NULL DEFAULT '',
                UNIQUE(fund_code, base_year_month)
            )
        """))

        conn.execute(text("""
            CREATE TABLE fund_info (
                fund_code      TEXT PRIMARY KEY,
                manager_name   TEXT NOT NULL,
                inception_date TEXT NOT NULL,
                fund_type      TEXT NOT NULL,
                bm_name        TEXT NOT NULL
            )
        """))

        conn.execute(text("""
            CREATE TABLE tru_stck_ma (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                company_code  TEXT NOT NULL,
                fund_code     TEXT NOT NULL,
                fund_name     TEXT NOT NULL,
                stock_code    TEXT NOT NULL,
                stock_name    TEXT NOT NULL,
                sector        TEXT NOT NULL,
                date          TEXT NOT NULL,
                close_price   INTEGER NOT NULL,
                holding_qty   INTEGER NOT NULL,
                avg_buy_price INTEGER NOT NULL
            )
        """))
        conn.execute(text("""
            CREATE INDEX idx_tru_stck_ma_lookup
            ON tru_stck_ma (company_code, fund_code, date, stock_code)
        """))

        start_date = date(2020, 1, 1)
        end_date   = date(2026, 5, 18)

        for seed_idx, (company_code, fund_code, fund_name, bm_code) in enumerate(FUNDS):
            nav_series = _generate_nav_series(start_date, end_date, seed=seed_idx * 42)
            conn.execute(
                text("""
                    INSERT INTO fund_nav
                        (company_code, fund_code, fund_name, date, adj_nav, net_assets, bm_code)
                    VALUES
                        (:company_code, :fund_code, :fund_name, :date, :adj_nav, :net_assets, :bm_code)
                """),
                [{"company_code": company_code, "fund_code": fund_code,
                  "fund_name": fund_name, "date": d, "adj_nav": nav,
                  "net_assets": net_assets, "bm_code": bm_code}
                 for d, nav, net_assets in nav_series],
            )
            conn.execute(
                text("""
                    INSERT INTO fund_cash_flow
                        (company_code, fund_code, fund_name, date, cash_flow)
                    VALUES
                        (:company_code, :fund_code, :fund_name, :date, :cash_flow)
                """),
                _generate_cash_flows(company_code, fund_code, fund_name),
            )

        # fund_info 삽입
        conn.execute(
            text("""
                INSERT INTO fund_info (fund_code, manager_name, inception_date, fund_type, bm_name)
                VALUES (:fund_code, :manager_name, :inception_date, :fund_type, :bm_name)
            """),
            [
                {"fund_code": fc, "manager_name": mn, "inception_date": inc,
                 "fund_type": ft, "bm_name": bm}
                for fc, (mn, inc, ft, bm) in FUND_INFO_DATA.items()
            ],
        )

        stock_price_map = _generate_stock_prices(start_date, end_date)
        _generate_stock_holdings(conn, stock_price_map)

        # 샘플 report_registry / report_content (A0001, 2026-05)
        conn.execute(
            text("""
                INSERT OR IGNORE INTO report_registry
                    (company_code, fund_code, fund_name, base_year_month)
                VALUES
                    (:company_code, :fund_code, :fund_name, :base_year_month)
            """),
            {"company_code": "03069", "fund_code": "A0001",
             "fund_name": "삼성코리아주식펀드", "base_year_month": "2026-05"},
        )
        conn.execute(
            text("""
                INSERT OR IGNORE INTO report_content
                    (fund_code, base_year_month,
                     fund_overview, holdings, performance, manager_comment, market_analysis)
                VALUES
                    (:fund_code, :base_year_month,
                     :fund_overview, :holdings, :performance, :manager_comment, :market_analysis)
            """),
            {
                "fund_code": "A0001",
                "base_year_month": "2026-05",
                "fund_overview": (
                    "삼성코리아주식펀드는 국내 대형 우량주 중심의 장기 성장형 펀드입니다.\n"
                    "설정일: 2018년 3월 15일 / 운용역: 김철수 / 벤치마크: 코스피\n"
                    "펀드는 반도체·전기전자·IT 업종 위주로 포트폴리오를 구성하며, "
                    "중장기 이익 성장 모멘텀이 뚜렷한 기업에 집중 투자합니다.\n"
                    "2026년 5월 말 기준 순자산은 약 2,100억 원이며, 설정 이후 누적 수익률은 +38.4%입니다."
                ),
                "holdings": (
                    "[보유 종목 현황 – 2026년 5월 기준]\n"
                    "1. 삼성전자 (005930) — 보유 수량 10,000주 / 평균매입단가 68,000원 / 비중 약 32%\n"
                    "   반도체 업황 회복 및 HBM 수주 확대에 따른 이익 개선 기대로 최선호 종목으로 유지\n\n"
                    "2. SK하이닉스 (000660) — 보유 수량 3,000주 / 평균매입단가 140,000원 / 비중 약 22%\n"
                    "   AI 서버용 HBM3E 출하 증가로 2분기 영업이익 대폭 상향 전망\n\n"
                    "3. POSCO홀딩스 (005490) — 보유 수량 500주 / 평균매입단가 350,000원 / 비중 약 9%\n"
                    "   이차전지 소재(양극재) 자회사 실적 가시화, 철강 부문 원가 절감 효과 반영\n\n"
                    "TOP3 합산 비중: 약 63% / 포트폴리오 집중도(HHI): 2,450"
                ),
                "performance": (
                    "[수익률 및 성과 – 2026년 5월]\n"
                    "• 월간 수익률: +3.2% (벤치마크 코스피 +1.8% 대비 +1.4%p 초과)\n"
                    "• 연초 이후(YTD): +11.7% (코스피 YTD +7.3% 대비 +4.4%p 초과)\n"
                    "• 설정 이후 누적: +38.4% (코스피 누적 +21.2% 대비 +17.2%p 초과)\n\n"
                    "성과 기여 상위 종목\n"
                    "  ① SK하이닉스: +2.1%p 기여 (월간 주가 +14.3%)\n"
                    "  ② 삼성전자: +0.8%p 기여 (월간 주가 +5.1%)\n\n"
                    "리스크 지표\n"
                    "  - 표준편차(1Y): 12.4% / 샤프지수(1Y): 0.91 / 최대낙폭(MDD): -9.7%"
                ),
                "manager_comment": (
                    "2026년 5월은 미 연준의 금리 동결 시사와 엔비디아 실적 서프라이즈를 계기로 "
                    "글로벌 반도체 업종이 강한 반등세를 보였습니다.\n\n"
                    "당 펀드는 HBM 공급망 핵심 기업인 SK하이닉스와 삼성전자의 비중을 "
                    "전월 대비 각 +2%p 확대하였으며, 이 결정이 월간 초과 성과의 주된 원인이었습니다.\n\n"
                    "6월 운용 방향:\n"
                    "- 반도체 비중(현재 54%)은 당분간 유지하되, 주가 급등 시 차익 실현 검토\n"
                    "- 내수 소비 회복 지표 모니터링 후 소비재·유통 섹터 편입 검토\n"
                    "- 환율 변동성 확대에 대비해 수출 비중 높은 전기전자 종목 비중 점진적 조정 예정"
                ),
                "market_analysis": (
                    "[시장 분석 – 2026년 5월]\n\n"
                    "■ 글로벌 매크로\n"
                    "미 FOMC는 5월 회의에서 금리를 동결(4.50~4.75%)하며 "
                    "'데이터 의존적 접근'을 재확인했습니다. "
                    "PCE 물가 둔화 흐름이 이어지면서 9월 첫 인하 가능성이 시장에서 높아지고 있습니다.\n\n"
                    "■ 국내 증시\n"
                    "코스피는 2,820선에서 2,970선으로 월간 +5.3% 상승하였습니다. "
                    "외국인이 반도체 위주로 약 2.4조 원 순매수하며 지수 상승을 이끌었습니다. "
                    "코스닥은 AI 소부장 테마 강세로 +6.8% 상승, 상대적 강세를 나타냈습니다.\n\n"
                    "■ 섹터 동향\n"
                    "  - 반도체: AI 수요 지속에 따른 HBM·DDR5 공급 부족 우려 재부각 → 강세\n"
                    "  - 철강/소재: 중국 부동산 경기 회복 기대감에 소폭 반등\n"
                    "  - IT/인터넷: 광고 시장 회복 및 AI 서비스 수익화 기대감으로 완만한 상승\n\n"
                    "■ 리스크 요인\n"
                    "  - 미·중 무역 마찰 재점화 가능성\n"
                    "  - 원/달러 환율 1,370원대 고착 시 수입 비용 부담\n"
                    "  - 2분기 어닝 시즌 실망 시 밸류에이션 부담 부각 가능"
                ),
            },
        )

    print(f"DB 초기화 완료: {engine.url}")


if __name__ == "__main__":
    init_db()
