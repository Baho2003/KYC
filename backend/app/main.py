from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.routes.kyc import router as kyc_router

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"

app = FastAPI(
    title="KYC API",
    description="Shaxsni tasdiqlash xizmati — YuzId (Soliq ID) integratsiyasi",
    version="1.0.0",
)

app.include_router(kyc_router)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/")
async def index() -> FileResponse:
    return FileResponse(STATIC_DIR / "index.html")


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
