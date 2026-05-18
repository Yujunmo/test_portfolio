from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.controllers.fund_router import router as fund_router
from app.controllers.performance_router import router as performance_router
from app.controllers.registry_router import router as registry_router
from app.controllers.report_router import router as report_router
from app.controllers.stock_router import router as stock_router
from app.controllers.xirr_router import router as xirr_router
from app.db.database import DB_PATH
from app.db.init_db import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    if not DB_PATH.exists():
        print("DB가 없으므로 초기 데이터를 생성합니다...")
        init_db()
    yield


app = FastAPI(title="BIGS API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(fund_router)
app.include_router(performance_router)
app.include_router(xirr_router)
app.include_router(stock_router)
app.include_router(report_router)
app.include_router(registry_router)


@app.get("/health")
def health():
    return {"status": "ok"}
