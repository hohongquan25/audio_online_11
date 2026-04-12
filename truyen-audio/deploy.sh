#!/bin/bash

# Script tự động deploy ứng dụng lên VPS
# Sử dụng: ./deploy.sh

set -e

echo "🚀 Bắt đầu deploy Truyen Audio..."

# Kiểm tra file .env.production
if [ ! -f .env.production ]; then
    echo "❌ Không tìm thấy file .env.production"
    echo "📝 Vui lòng tạo file .env.production từ .env.production.example"
    exit 1
fi

# Pull code mới nhất (nếu dùng Git)
if [ -d .git ]; then
    echo "📥 Pulling latest code..."
    git pull origin main || git pull origin master
fi

# Stop containers hiện tại
echo "🛑 Stopping current containers..."
docker-compose down

# Build và start containers mới
echo "🔨 Building and starting containers..."
docker-compose up -d --build

# Đợi database sẵn sàng
echo "⏳ Waiting for database..."
sleep 10

# Chạy Prisma migrations
echo "🗄️  Running database migrations..."
docker-compose exec -T app npx prisma migrate deploy

# Kiểm tra trạng thái
echo "✅ Checking container status..."
docker-compose ps

# Hiển thị logs
echo "📋 Recent logs:"
docker-compose logs --tail=50 app

echo ""
echo "✨ Deploy hoàn tất!"
echo "🌐 Ứng dụng đang chạy tại: http://localhost:3000"
echo "📊 Xem logs: docker-compose logs -f app"
