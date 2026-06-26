from fastapi import APIRouter, HTTPException

from app.integrations.yuzid import CompareFaceRequest, CompareFaceResponse
from app.integrations.yuzid.client import YuzIdApiError
from app.services.face_comparison import compare_face

router = APIRouter(prefix="/kyc", tags=["KYC"])


@router.post("/compare-face", response_model=CompareFaceResponse)
async def verify_face(request: CompareFaceRequest) -> CompareFaceResponse:
    """
    Сравнение лица пользователя с фотографией в паспорте через YuzId API.

    Изображение должно быть в base64, разрешение 420p или 780p,
    с хорошим освещением и чётко видимым лицом.
    """
    try:
        return await compare_face(request)
    except YuzIdApiError as exc:
        raise HTTPException(status_code=400, detail=exc.message) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Ошибка при обращении к YuzId API: {exc}") from exc
