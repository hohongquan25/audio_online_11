#!/bin/bash

# Script tự động setup server Digital Ocean
# Chạy script này trên VPS sau khi SSH vào

set -e

echo "🚀 Bắt đầu setup server..."

# Update system
echo "📦 Updating system..."
apt update && apt upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# Install Docker Compose
echo "🔧 Installing Docker Compose..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Verify installations
echo "✅ Verifying installations..."
docker --version
docker-compose --version

# Install Nginx
echo "🌐 Installing Nginx..."
apt install nginx -y
systemctl enable nginx
systemctl start nginx

# Install other useful tools
echo "🛠️ Installing additional tools..."
apt install -y git curl wget nano ufw certbot python3-certbot-nginx

# Setup firewall
echo "🔥 Configuring firewall..."
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw --force enable

# Create app directory
echo "📁 Creating application directory..."
mkdir -p /var/www
cd /var/www

echo ""
echo "✨ Server setup hoàn tất!"
echo ""
echo "📋 Thông tin:"
echo "   - Docker: $(docker --version)"
echo "   - Docker Compose: $(docker-compose --version)"
echo "   - Nginx: Đã cài đặt và chạy"
echo "   - Firewall: Đã bật (ports 22, 80, 443)"
echo ""
echo "🎯 Bước tiếp theo:"
echo "   1. Clone code: cd /var/www && git clone YOUR_REPO_URL"
echo "   2. Hoặc upload code bằng SCP"
echo ""
