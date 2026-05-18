# CLAUDE.md — BIGS 프로젝트 가이드

## 프로젝트 개요

운용사 펀드 관리 시스템. FastAPI(백엔드) + React/Vite/TypeScript(프론트엔드) 풀스택 구성.

---

## 서버 실행

```bash
# 백엔드 (backend/ 디렉터리에서)
.venv/bin/python -m uvicorn app.main:app --reload

# 프론트엔드 (frontend/ 디렉터리에서)
npm run dev
```

- 백엔드: `http://localhost:8000`
- 프론트엔드: `http://localhost:5173` (Vite가 `/api` → `8000` 프록시)
- DB 파일(`data/bigs.db`)이 없으면 서버 시작 시 `init_db()`가 자동 실행됨

---

## 아키텍처 규칙

### 백엔드

- **MVC 패턴**: `controllers/` (라우터) → `services/` (비즈니스 로직) → `db/database.py` (DB 접근)
- **SQL 파일 분리**: 모든 쿼리는 `sql/` 디렉터리의 `.sql` 파일에 저장하고 런타임에 로드. Python 코드 안에 SQL 문자열 직접 작성 금지 (단, `init_db.py`의 DDL 제외)
- **쿼리 실행**: `execute_sql(relative_path, params, expanding_keys)` 함수 사용
- **IN 절**: SQL 파일에서 `IN :fund_codes` (괄호 없음), 호출 시 `expanding_keys=["fund_codes"]`
- **파라미터 중복 참조**: 동일 파라미터를 여러 곳에서 쓸 때는 `WITH params AS (SELECT :p AS col)` CTE 패턴 사용
- **스키마**: `app/models/schemas.py`에 Pydantic 모델 정의
- **라우터 prefix**: `/api/{resource}` 형식, `app/main.py`에 등록

### 프론트엔드

- **API 호출**: `src/api/` 디렉터리에 리소스별 파일로 분리, Axios 클라이언트(`src/api/client.ts`) 사용
- **타입**: `src/types/index.ts`에 공통 타입 정의. 페이지 간 공유 타입은 해당 페이지 파일에서 export
- **스타일**: Tailwind CSS 유틸리티 클래스 사용. `primary-*` 색상은 Tailwind config에 정의됨
- **차트**: Recharts (AreaChart, BarChart, ComposedChart, LineChart)

---

## DB 스키마

```sql
fund_nav          -- 일별 기준가 (company_code, fund_code, fund_name, date, adj_nav, net_assets, bm_code)
fund_cash_flow    -- 현금흐름 (company_code, fund_code, fund_name, date, cash_flow)
fund_info         -- 펀드 추가정보 (fund_code PK, manager_name, inception_date, fund_type, bm_name)
tru_stck_ma       -- 주식 보유현황 (company_code, fund_code, stock_code, sector, date, close_price, holding_qty, avg_buy_price)
report_registry   -- 보고 펀드 등록 (company_code, fund_code, fund_name, base_year_month, UNIQUE(fund_code, base_year_month))
report_content    -- 운용역 코멘트 (fund_code, base_year_month, fund_overview, holdings, performance, manager_comment, market_analysis, UNIQUE(fund_code, base_year_month))
```

DB 스키마 변경 시 반드시 `app/db/init_db.py`의 `init_db()` 함수도 함께 수정하고 DB 파일을 삭제 후 재시작.

---

## SQL 파일 위치

```
backend/sql/
├── fund/           get_all.sql
├── performance/    get_nav_chart.sql, get_period_returns.sql
├── registry/       get_all.sql, get_content.sql
├── report/         get_fund_info.sql, get_holdings_top10.sql, get_nav_series.sql, get_sector_weights.sql
├── stock/          get_stock_holdings.sql
└── xirr/           get_cash_flows.sql, get_latest_nav.sql
```

---

## 주요 패턴 및 주의사항

- **BM 데이터**: `yfinance`로 외부 조회. 코스피 → `^KS11`, 코스닥 → `^KQ11`
- **XIRR**: `scipy.optimize.newton` 사용. 현금흐름 마지막에 기준일 잔존 평가금액(양수)을 추가해서 계산
- **수익률 계산**: Python 코드가 아닌 SQL에서 완전히 계산 완료 후 반환 (get_period_returns.sql)
- **print CSS**: `@media print`에서 `aside`(사이드바)와 `.no-print` 클래스 요소를 숨김. PDF 저장 버튼에 `no-print` 클래스 부여
- **영업일 처리**: NAV 데이터가 영업일만 존재하므로 기간 수익률 계산 시 `date()` 함수로 가장 가까운 날짜의 NAV를 조회
