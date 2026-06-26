from fastapi import FastAPI

from app.routes.kyc import router as kyc_router

app = FastAPI(
    title="KYC API",
    description="Сервис верификации личности с интеграцией YuzId (Soliq ID)",
    version="1.0.0",
)

app.include_router(kyc_router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
