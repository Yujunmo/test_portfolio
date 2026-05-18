# BIGS — 펀드 관리 시스템

운용사 펀드의 성과 분석, 내부수익률(XIRR), 주식 보유현황, 월별 운용보고서를 제공하는 풀스택 웹 애플리케이션입니다.

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS + Recharts |
| Backend | FastAPI + SQLAlchemy + SQLite |
| 패키지 관리 | pip (backend) / npm (frontend) |

---

## 프로젝트 구조

```
new_bigs/
├── backend/
│   ├── app/
│   │   ├── controllers/   # FastAPI 라우터
│   │   ├── services/      # 비즈니스 로직
│   │   ├── models/        # Pydantic 스키마
│   │   └── db/            # DB 초기화 및 유틸리티
│   ├── sql/               # SQL 파일 (런타임 로드)
│   │   ├── fund/
│   │   ├── performance/
│   │   ├── registry/
│   │   ├── report/
│   │   ├── stock/
│   │   └── xirr/
│   ├── data/              # SQLite DB 파일 (자동 생성)
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── api/           # Axios API 클라이언트
    │   ├── components/    # 재사용 컴포넌트
    │   ├── pages/         # 페이지 컴포넌트
    │   └── types/         # TypeScript 타입 정의
    └── package.json
```

---

## 실행 방법

### 1. 백엔드

```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
.venv/bin/python -m uvicorn app.main:app --reload
```

- 서버: `http://localhost:8000`
- DB 파일(`data/bigs.db`)이 없으면 최초 실행 시 자동으로 생성되고 샘플 데이터가 삽입됩니다.

### 2. 프론트엔드

```bash
cd frontend
npm install
npm run dev
```

- 앱: `http://localhost:5173`
- Vite 개발 서버가 `/api` 요청을 백엔드(`8000`)로 프록시합니다.

---

## 주요 기능

### 펀드별 성과분석
- 복수 펀드 선택 후 기간별 수익률 비교 (1일 / 1주 / 1개월 / 3개월 / 6개월 / 1년 / 설정후)
- 기준가 추이 차트 (AreaChart)
- BM 지수(코스피·코스닥 등) 오버레이 (yfinance)

### 내부수익률 (XIRR)
- 펀드별 현금흐름 기반 XIRR 계산 (scipy.optimize.newton)
- 기준일 기준 잔존 평가금액 자동 반영

### 주식 보유현황
- 운용사·펀드·기준일 지정 후 보유 종목 조회
- 평가금액·매입금액·평가손익·수익률·전일대비 표시

### 월별 운용보고서
- **펀드 개요 탭**: 보고 펀드 등록/삭제, 섹션별 운용역 코멘트 작성 및 DB 저장
- **보고서 탭**: 펀드 기본정보·수익률 성과·자산 구성·보유 종목 TOP10·운용역 코멘트 통합 보고서
- PDF 저장 버튼 (브라우저 인쇄 → PDF로 저장)

---

## API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/funds` | 전체 펀드 목록 |
| GET | `/api/performance/returns` | 기간별 수익률 |
| GET | `/api/performance/nav-chart` | 기준가 차트 데이터 |
| GET | `/api/xirr` | XIRR 계산 |
| GET | `/api/stock-holdings` | 주식 보유현황 |
| GET | `/api/report/monthly` | 월별 운용보고서 |
| GET | `/api/registry` | 등록된 보고 펀드 목록 |
| POST | `/api/registry` | 보고 펀드 등록 |
| DELETE | `/api/registry/{fund_code}/{base_year_month}` | 보고 펀드 삭제 |
| GET | `/api/registry/{fund_code}/{base_year_month}/content` | 운용역 코멘트 조회 |
| PUT | `/api/registry/{fund_code}/{base_year_month}/content` | 운용역 코멘트 저장 |

---

## 샘플 데이터

DB 초기화 시 아래 데이터가 자동 생성됩니다.

| 운용사코드 | 펀드코드 | 펀드명 |
|-----------|---------|--------|
| 03069 | A0001 | 삼성코리아주식펀드 |
| 03069 | A0002 | 미래에셋성장주식펀드 |
| 04021 | B0001 | KB밸류채권혼합펀드 |

- NAV·현금흐름: 2020-01-01 ~ 2026-05-18 (영업일 기준 랜덤 생성)
- 보유 종목: 삼성전자·SK하이닉스·POSCO홀딩스·LG전자·NAVER
- 운용보고서 샘플: A0001 / 2026-05 (전 섹션 작성 완료)
