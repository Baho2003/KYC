import time
from typing import Any, Optional

import httpx

from app.config import settings
from app.integrations.yuzid.types import CompareFaceRequest, CompareFaceResponse


class YuzIdApiError(Exception):
    def __init__(self, message: str, detail: Any = None) -> None:
        self.message = message
        self.detail = detail
        super().__init__(message)


class YuzIdClient:
    """HTTP-клиент для API YuzId (Soliq ID — сравнение лиц)."""

    def __init__(
        self,
        base_url: Optional[str] = None,
        login: Optional[str] = None,
        password: Optional[str] = None,
    ) -> None:
        self._base_url = (base_url or settings.yuzid_api_base_url).rstrip("/")
        self._login = login or settings.yuzid_login
        self._password = password or settings.yuzid_password
        self._token: Optional[str] = None
        self._token_expires_at: float = 0

    async def _get_token(self, client: httpx.AsyncClient) -> str:
        if self._token and time.time() < self._token_expires_at:
            return self._token

        response = await client.post(
            f"{self._base_url}/auth/get-token",
            auth=(self._login, self._password),
        )
        response.raise_for_status()
        payload = response.json()
        self._token = payload["token"]
        # JWT без явного exp в payload — обновляем за 5 минут до истечения (55 мин)
        self._token_expires_at = time.time() + 55 * 60
        return self._token

    async def compare_face(self, request: CompareFaceRequest) -> CompareFaceResponse:
        body: dict[str, Any] = {
            "pinfl": request.pinfl,
            "image": request.image,
            "deviceId": request.device_id,
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            token = await self._get_token(client)
            response = await client.post(
                f"{self._base_url}/soliq-id/compare-face-web",
                json=body,
                headers={"Authorization": f"Bearer {token}"},
            )
            response.raise_for_status()
            payload = response.json()

            if "success" in payload:
                return CompareFaceResponse.model_validate(payload)

            if "detail" in payload:
                detail = payload["detail"]
                message = detail if isinstance(detail, str) else str(detail)
                raise YuzIdApiError(message, detail)

            raise YuzIdApiError("Неизвестный формат ответа YuzId API", payload)
