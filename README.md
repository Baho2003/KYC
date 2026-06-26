# KYC

Shaxsni tasdiqlash xizmati — [YuzId API](https://api.yuzid.uz) (Soliq ID) integratsiyasi va o'zbek tilidagi veb-sahifa.

## Tezkor ishga tushirish

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # YUZID_LOGIN va YUZID_PASSWORD ni kiriting
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- **Veb-sahifa:** http://localhost:8000
- **API hujjatlari:** http://localhost:8000/docs

## Veb-sahifa

O'zbek tilidagi interfeys (`/`):

- JSHSHIR (PINFL) kiritish
- Kamera orqali yuz suratini olish yoki fayl yuklash
- YuzId API orqali shaxsni tasdiqlash
- Natijani ko'rsatish (familiya, ism, otasining ismi)

## API endpointlari

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/health` | Проверка работоспособности |
| POST | `/kyc/compare-face` | Сравнение лица с паспортными данными |

### POST `/kyc/compare-face`

**Тело запроса:**

```json
{
  "deviceId": "идентификатор_устройства",
  "pinfl": "12345678901234",
  "image": "base64_код_изображения"
}
```

| Поле | Тип | Обязательно | Описание |
|------|-----|-------------|----------|
| `pinfl` | string | да | 14-значный ПИНФЛ |
| `image` | string | да | Изображение лица в base64 (420p или 780p) |
| `deviceId` | string | нет | Идентификатор устройства |

**Успешный ответ:**

```json
{
  "success": true,
  "code": 1,
  "message": "Шахсингиз тасдиқланди.",
  "data": {
    "pinfl": 35454523445,
    "surName": "surName",
    "name": "Name",
    "patronymicName": "patronymicName"
  }
}
```

**Неуспешный ответ:**

```json
{
  "success": false,
  "code": 3,
  "message": "Сообщение об ошибке",
  "data": null
}
```

### Коды ошибок

| code | Описание |
|------|----------|
| 3 | Личность не подтверждена — лицо не соответствует фото в паспорте |
| 10 | Жизненность не подтверждена — низкое качество изображения или технические проблемы |

## YuzId API (внешний)

| Параметр | Значение |
|----------|----------|
| Host | `https://api.yuzid.uz` |
| Токен | `POST /auth/get-token` (Basic Auth) |
| Сравнение лиц | `POST /soliq-id/compare-face-web` (Bearer token) |

Переменные окружения (`backend/.env`):

```
YUZID_API_BASE_URL=https://api.yuzid.uz
YUZID_LOGIN=UNITEL
YUZID_PASSWORD=<пароль>
```

## Структура проекта

```
backend/
├── static/
│   ├── index.html          # O'zbek tilidagi veb-sahifa
│   ├── css/style.css
│   └── js/app.js
├── app/
│   ├── config.py                    # Настройки из .env
│   ├── main.py                      # FastAPI приложение
│   ├── integrations/yuzid/
│   │   ├── client.py                # HTTP-клиент YuzId
│   │   └── types.py                 # Модели запроса/ответа
│   ├── routes/kyc.py                # REST-маршруты
│   └── services/face_comparison.py  # Бизнес-логика
├── .env.example
└── requirements.txt
```

## Рекомендации по изображениям

- Разрешение: **420p** или **780p**
- Хорошее освещение, чётко видимое лицо, минимум шума
- Перед кодированием в base64 убедитесь в корректном формате и размере
