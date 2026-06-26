# Hostingga deploy — qadam-baqadam

## Tez deploy (Render.com, 5 daqiqa)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Baho2003/KYC)

### 1-qadam: Render ga ulaning

1. Yuqoridagi **Deploy to Render** tugmasini bosing
2. GitHub akkauntingiz bilan kiring
3. `Baho2003/KYC` repozitoriyasiga ruxsat bering

### 2-qadam: Environment o'zgaruvchilar

Render so'raganda quyidagilarni kiriting:

| O'zgaruvchi | Qiymat |
|-------------|--------|
| `YUZID_LOGIN` | `UNITEL` |
| `YUZID_PASSWORD` | YuzId API parolingiz |

### 3-qadam: Deploy

**Apply** yoki **Create Web Service** tugmasini bosing. 3–5 daqiqada tayyor bo'ladi.

Sizning manzilingiz: `https://kyc.onrender.com` (yoki Render bergan domen)

### 4-qadam: Tekshirish

```bash
curl https://SIZNING-DOMENINGIZ.onrender.com/health
```

Javob: `{"status":"ok"}`

Brauzerda oching — o'zbek tilidagi KYC sahifasi ko'rinadi.

---

## Avtomatik deploy (GitHub → Render)

Har safar `main` ga push qilganda avtomatik deploy uchun:

1. Render dashboard → **kyc** servis → **Settings** → **Deploy Hook**
2. URL ni nusxalang
3. GitHub → **Settings** → **Secrets and variables** → **Actions**
4. Yangi secret: `RENDER_DEPLOY_HOOK` = deploy hook URL
5. Keyingi push larda avtomatik yangilanadi

---

## Railway.app

1. [railway.app/new](https://railway.app/new) → **Deploy from GitHub repo**
2. `Baho2003/KYC` ni tanlang
3. **Variables** qo'shing:
   ```
   YUZID_LOGIN=UNITEL
   YUZID_PASSWORD=<parol>
   ```
4. **Settings** → **Networking** → **Generate Domain**

---

## VPS (Ubuntu server)

```bash
git clone https://github.com/Baho2003/KYC.git /opt/kyc
cd /opt/kyc
cp backend/.env.example backend/.env
nano backend/.env   # YUZID_LOGIN va YUZID_PASSWORD

docker compose up -d --build
curl http://localhost:8000/health
```

Nginx + SSL uchun `README.md` dagi bo'limga qarang.

---

## Muammolar

| Muammo | Yechim |
|--------|--------|
| `Application failed to respond` | `YUZID_LOGIN` va `YUZID_PASSWORD` to'g'ri ekanini tekshiring |
| Kamera ishlamaydi | HTTPS kerak (Render/Railway avtomatik beradi) |
| 502 xato | YuzId API bilan bog'lanishni tekshiring |
| Render sekin ishga tushadi | Free plan da 15 daqiqa kutgandan keyin uxlaydi, birinchi so'rov sekin |

---

## Muhim

- Parollarni GitHub ga commit qilmang — faqat hosting panelida kiriting
- Kamera uchun **HTTPS** majburiy
- Free Render rejimida sayt ishlatilmasa 15 daqiqada uxlaydi
