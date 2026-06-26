#!/bin/bash
set -euo pipefail

APP_DIR="/opt/kyc"
REPO_URL="${REPO_URL:-https://github.com/Baho2003/KYC.git}"
BRANCH="${BRANCH:-main}"

echo "==> KYC ilovasini VPS ga o'rnatish"

if ! command -v docker &>/dev/null; then
  echo "Docker topilmadi. O'rnatilmoqda..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
fi

if ! command -v docker compose &>/dev/null; then
  echo "Docker Compose plugin kerak."
  exit 1
fi

mkdir -p "$APP_DIR"
cd "$APP_DIR"

if [ ! -d .git ]; then
  git clone --branch "$BRANCH" "$REPO_URL" .
else
  git fetch origin
  git checkout "$BRANCH"
  git pull origin "$BRANCH"
fi

if [ ! -f backend/.env ]; then
  echo ""
  echo "DIQQAT: backend/.env faylini yarating:"
  echo "  cp backend/.env.example backend/.env"
  echo "  nano backend/.env"
  echo ""
  exit 1
fi

docker compose pull 2>/dev/null || true
docker compose build --no-cache
docker compose up -d

echo ""
echo "Tayyor! Ilova ishga tushdi."
echo "Tekshirish: curl http://localhost:8000/health"
