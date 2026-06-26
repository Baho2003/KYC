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

## Hostingga deploy qilish

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Baho2003/KYC)

**Batafsil ko'rsatma:** [DEPLOY.md](DEPLOY.md)

### Tez boshlash (Render)

| O'zgaruvchi | Majburiy | Tavsif |
|-------------|----------|--------|
| `YUZID_LOGIN` | ha | YuzId API login |
| `YUZID_PASSWORD` | ha | YuzId API parol |
| `YUZID_API_BASE_URL` | yo'q | Default: `https://api.yuzid.uz` |
| `PORT` | yo'q | Default: `8000` |

---

### 1-variant: Render.com (tavsiya etiladi, bepul)

1. [render.com](https://render.com) da ro'yxatdan o'ting
2. **New → Blueprint** yoki **New → Web Service**
3. GitHub repozitoriyni ulang: `Baho2003/KYC`
4. `render.yaml` avtomatik aniqlanadi
5. **Environment** bo'limida qo'shing:
   - `YUZID_LOGIN` = `UNITEL`
   - `YUZID_PASSWORD` = `<parolingiz>`
6. **Deploy** tugmasini bosing

Deploy tugagach: `https://kyc-xxxx.onrender.com`

---

### 2-variant: Railway.app

1. [railway.app](https://railway.app) da GitHub orqali login
2. **New Project → Deploy from GitHub repo**
3. `KYC` repozitoriyni tanlang
4. **Variables** bo'limiga qo'shing:
   ```
   YUZID_LOGIN=UNITEL
   YUZID_PASSWORD=<parolingiz>
   ```
5. Railway `Dockerfile` va `railway.toml` ni avtomatik ishlatadi
6. **Settings → Generate Domain** orqali domen oling

---

### 3-variant: VPS (Ubuntu server)

Serverda Docker o'rnatilgan bo'lishi kerak.

```bash
# 1. Repozitoriyni klonlash
git clone https://github.com/Baho2003/KYC.git /opt/kyc
cd /opt/kyc

# 2. Environment sozlash
cp backend/.env.example backend/.env
nano backend/.env   # YUZID_LOGIN va YUZID_PASSWORD kiriting

# 3. Ishga tushirish
docker compose up -d --build

# 4. Tekshirish
curl http://localhost:8000/health
```

Yoki avtomatik skript:

```bash
chmod +x scripts/deploy-vps.sh
sudo ./scripts/deploy-vps.sh
```

**Nginx + HTTPS** (ixtiyoriy):

```nginx
server {
    listen 80;
    server_name sizning-domeningiz.uz;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        client_max_body_size 10M;
    }
}
```

Keyin Certbot bilan SSL: `sudo certbot --nginx -d sizning-domeningiz.uz`

---

### 4-variant: Docker (qo'lda)

```bash
# Build
docker build -t kyc-app .

# Ishga tushirish
docker run -d \
  --name kyc \
  -p 8000:8000 \
  -e YUZID_LOGIN=UNITEL \
  -e YUZID_PASSWORD=<parolingiz> \
  --restart unless-stopped \
  kyc-app
```

---

### Deploy keyin tekshirish

```bash
curl https://sizning-domeningiz/health
# {"status":"ok"}

# Brauzerda oching
# https://sizning-domeningiz/
```

**Muhim:** Kamera ishlashi uchun HTTPS kerak (Render va Railway avtomatik beradi).

## Структура проекта

```
KYC/
├── Dockerfile              # Production Docker image
├── docker-compose.yml      # VPS uchun
├── render.yaml             # Render.com konfiguratsiyasi
├── railway.toml            # Railway konfiguratsiyasi
├── scripts/deploy-vps.sh   # VPS avtomatik o'rnatish
└── backend/
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
