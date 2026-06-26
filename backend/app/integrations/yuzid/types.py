from enum import IntEnum
from typing import Optional

from pydantic import BaseModel, Field


class ErrorCode(IntEnum):
    IDENTITY_NOT_CONFIRMED = 3
    LIVENESS_NOT_CONFIRMED = 10


class CompareFaceRequest(BaseModel):
    pinfl: str = Field(..., min_length=14, max_length=14, description="14-значный ПИНФЛ")
    image: str = Field(..., description="Изображение лица в формате base64")
    device_id: str = Field(
        default="web",
        alias="deviceId",
        description="Идентификатор устройства (API требует это поле)",
    )

    model_config = {"populate_by_name": True}


class CompareFaceSuccessData(BaseModel):
    pinfl: int
    sur_name: str = Field(..., alias="surName")
    name: str
    patronymic_name: str = Field(..., alias="patronymicName")

    model_config = {"populate_by_name": True}


class CompareFaceResponse(BaseModel):
    success: bool
    code: int
    message: str
    data: Optional[CompareFaceSuccessData] = None
