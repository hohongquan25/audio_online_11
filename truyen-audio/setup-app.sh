#!/bin/bash

# Script setup application sau khi đã có code trên server
# Chạy trong thư mục /var/www/truyen-audio/truyen-audio

set -e

echo "🚀 Setup Truyen Audio Application..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Không tìm thấy package.json. Hãy chạy script trong thư mục truyen-audio/"
    exit 1
fi

# Create .env.production if not exists
if [ ! -f ".env.production" ]; then
    echo "📝 Tạo file .env.production..."
    cp .env.production.example .env.production
    
    echo ""
    echo "⚠️  QUAN TRỌNG: Bạn cần cập nhật file .env.production"
    echo ""
    read -p "Nhấn Enter để mở editor và cập nhật .env.production..."
    nano .env.production
fi

# Generate NEXTAUTH_SECRET if needed
echo ""
echo "🔑 Tạo NEXTAUTH_SECRET mới..."
SECRET=$(openssl rand -base64 32)
echo "NEXTAUTH_SECRET của bạn: $SECRET"
echo ""
read -p "Bạn có muốn tự động thêm vào .env.production? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Update or add NEXTAUTH_SECRET
    if grep -q "NEXTAUTH_SECRET=" .env.production; then
        sed -i "s|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=\"$SECRET\"|" .env.production
    else
        echo "NEXTAUTH_SECRET=\"$SECRET\"" >> .env.production
    fi
    echo "✅ Đã cập nhật NEXTAUTH_SECRET"
fi

# Get server IP
SERVER_IP=$(curl -s ifconfig.me)
echo ""
echo "🌐 IP của server: $SERVER_IP"
echo ""
read -p "Bạn có domain không? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Nhập domain của bạn (vd: truyenaudio.com): " DOMAIN
    NEXTAUTH_URL="https://$DOMAIN"
else
    DOMAIN=$SERVER_IP
    NEXTAUTH_URL="http://$SERVER_IP"
fi

# Update NEXTAUTH_URL
if grep -q "NEXTAUTH_URL=" .env.production; then
    sed -i "s|NEXTAUTH_URL=.*|NEXTAUTH_URL=\"$NEXTAUTH_URL\"|" .env.production
else
    echo "NEXTAUTH_URL=\"$NEXTAUTH_URL\"" >> .env.production
fi
echo "✅ Đã cập nhật NEXTAUTH_URL"

# Build and start containers
echo ""
echo "🐳 Building và starting Docker containers..."
docker-compose down 2>/dev/null || true
docker-compose up -d --build

# Wait for containers to be ready
echo "⏳ Đợi containers khởi động..."
sleep 15

# Check if containers are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Containers đang chạy"
else
    echo "❌ Có lỗi khi start containers. Xem logs:"
    docker-compose logs
    exit 1
fi

# Run migrations
echo ""
echo "🗄️  Chạy database migrations..."
docker-compose exec -T app npx prisma migrate deploy

# Ask about seeding
echo ""
read -p "Bạn có muốn seed database với dữ liệu mẫu? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 Seeding database..."
    docker-compose exec -T app npm run seed
fi

# Setup Nginx
echo ""
echo "🌐 Cấu hình Nginx..."

# Update nginx config with domain/IP
cp nginx.conf /tmp/truyen-audio-nginx.conf
sed -i "s/your-domain.com/$DOMAIN/g" /tmp/truyen-audio-nginx.conf
sed -i "s/www.your-domain.com/www.$DOMAIN/g" /tmp/truyen-audio-nginx.conf

# Copy to nginx sites
cp /tmp/truyen-audio-nginx.conf /etc/nginx/sites-available/truyen-audio

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Enable site
ln -sf /etc/nginx/sites-available/truyen-audio /etc/nginx/sites-enabled/

# Test nginx config
if nginx -t; then
    echo "✅ Nginx config OK"
    systemctl reload nginx
else
    echo "❌ Nginx config có lỗi"
    exit 1
fi

# Setup SSL if domain is provided
if [[ ! $DOMAIN =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo ""
    read -p "Bạn có muốn cài SSL certificate (HTTPS)? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🔒 Cài đặt SSL certificate..."
        certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --register-unsafely-without-email || echo "⚠️  SSL setup failed, bạn có thể chạy lại sau: certbot --nginx -d $DOMAIN"
    fi
fi

# Setup systemd service for auto-restart
echo ""
echo "⚙️  Cấu hình auto-restart..."
cat > /etc/systemd/system/truyen-audio.service <<EOF
[Unit]
Description=Truyen Audio Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$(pwd)
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable truyen-audio
echo "✅ Auto-restart đã được cấu hình"

# Show status
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ SETUP HOÀN TẤT! ✨"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Truy cập ứng dụng tại:"
echo "   $NEXTAUTH_URL"
echo ""
echo "📊 Container status:"
docker-compose ps
echo ""
echo "📋 Các lệnh hữu ích:"
echo "   - Xem logs: docker-compose logs -f"
echo "   - Restart: docker-compose restart"
echo "   - Stop: docker-compose down"
echo "   - Update code: git pull && docker-compose up -d --build"
echo ""
echo "🔍 Kiểm tra logs:"
docker-compose logs --tail=20
echo ""
