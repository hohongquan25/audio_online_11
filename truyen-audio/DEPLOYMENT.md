# Hướng Dẫn Deploy Lên VPS

## Yêu Cầu
- VPS với Ubuntu 20.04+ hoặc CentOS 7+
- Docker và Docker Compose đã cài đặt
- Domain name (tùy chọn, nhưng khuyến nghị)
- PostgreSQL database (có thể chạy trên VPS hoặc dùng dịch vụ cloud)

## Bước 1: Chuẩn Bị VPS

### 1.1. Kết nối SSH vào VPS
```bash
ssh root@your-vps-ip
```

### 1.2. Cài đặt Docker
```bash
# Cập nhật hệ thống
sudo apt update && sudo apt upgrade -y

# Cài đặt Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Cài đặt Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Kiểm tra cài đặt
docker --version
docker-compose --version
```

### 1.3. Cài đặt Nginx (làm reverse proxy)
```bash
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

## Bước 2: Upload Code Lên VPS

### Phương án A: Sử dụng Git (Khuyến nghị)
```bash
# Trên VPS
cd /var/www
sudo git clone https://github.com/your-username/your-repo.git truyen-audio
cd truyen-audio/truyen-audio
```

### Phương án B: Sử dụng SCP/SFTP
```bash
# Trên máy local
scp -r truyen-audio root@your-vps-ip:/var/www/
```

## Bước 3: Cấu Hình Environment Variables

```bash
# Trên VPS, tạo file .env.production
cd /var/www/truyen-audio/truyen-audio
sudo nano .env.production
```

Nội dung file `.env.production`:
```env
# Database - Thay đổi thông tin database của bạn
DATABASE_URL="postgresql://postgres:your-password@localhost:5432/truyen_audio?schema=public"

# NextAuth - Tạo secret mới cho production
NEXTAUTH_SECRET="your-production-secret-key-change-this"
NEXTAUTH_URL="https://your-domain.com"

# SMTP Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="TruyệnAudio <your-email@gmail.com>"

# Node Environment
NODE_ENV=production
```

**Lưu ý quan trọng:**
- Tạo `NEXTAUTH_SECRET` mới: `openssl rand -base64 32`
- Thay `your-domain.com` bằng domain thực của bạn
- Cập nhật thông tin database và SMTP

## Bước 4: Tạo Docker Compose File

```bash
sudo nano docker-compose.yml
```

Nội dung:
```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: truyen-audio-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: your-secure-password
      POSTGRES_DB: truyen_audio
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - truyen-audio-network

  # Next.js Application
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: truyen-audio-app
    restart: unless-stopped
    env_file:
      - .env.production
    ports:
      - "3000:3000"
    depends_on:
      - postgres
    networks:
      - truyen-audio-network
    environment:
      DATABASE_URL: "postgresql://postgres:your-secure-password@postgres:5432/truyen_audio?schema=public"

volumes:
  postgres_data:

networks:
  truyen-audio-network:
    driver: bridge
```

## Bước 5: Build và Chạy Application

```bash
# Build và start containers
sudo docker-compose up -d --build

# Kiểm tra logs
sudo docker-compose logs -f app

# Chạy Prisma migrations
sudo docker-compose exec app npx prisma migrate deploy

# (Tùy chọn) Seed database
sudo docker-compose exec app npm run seed
```

## Bước 6: Cấu Hình Nginx Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/truyen-audio
```

Nội dung:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS (sau khi cài SSL)
    # return 301 https://$server_name$request_uri;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Kích hoạt cấu hình:
```bash
sudo ln -s /etc/nginx/sites-available/truyen-audio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Bước 7: Cài Đặt SSL Certificate (HTTPS)

```bash
# Cài đặt Certbot
sudo apt install certbot python3-certbot-nginx -y

# Lấy SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal đã được cấu hình tự động
```

## Bước 8: Cấu Hình Firewall

```bash
# Cho phép HTTP, HTTPS và SSH
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## Các Lệnh Quản Lý Hữu Ích

```bash
# Xem logs
sudo docker-compose logs -f app

# Restart application
sudo docker-compose restart app

# Stop tất cả services
sudo docker-compose down

# Start lại
sudo docker-compose up -d

# Rebuild sau khi update code
sudo docker-compose up -d --build

# Xem trạng thái containers
sudo docker-compose ps

# Truy cập vào container
sudo docker-compose exec app sh

# Chạy Prisma commands
sudo docker-compose exec app npx prisma migrate deploy
sudo docker-compose exec app npx prisma studio
```

## Cập Nhật Code Mới

```bash
# Pull code mới từ Git
cd /var/www/truyen-audio/truyen-audio
sudo git pull origin main

# Rebuild và restart
sudo docker-compose up -d --build

# Chạy migrations nếu có
sudo docker-compose exec app npx prisma migrate deploy
```

## Monitoring và Backup

### Backup Database
```bash
# Tạo backup
sudo docker-compose exec postgres pg_dump -U postgres truyen_audio > backup_$(date +%Y%m%d).sql

# Restore backup
sudo docker-compose exec -T postgres psql -U postgres truyen_audio < backup_20240101.sql
```

### Monitoring
```bash
# Xem resource usage
sudo docker stats

# Xem disk usage
df -h
```

## Troubleshooting

### Lỗi kết nối database
```bash
# Kiểm tra PostgreSQL đang chạy
sudo docker-compose ps postgres

# Xem logs database
sudo docker-compose logs postgres
```

### Lỗi build Docker
```bash
# Clean build
sudo docker-compose down
sudo docker system prune -a
sudo docker-compose up -d --build
```

### Application không start
```bash
# Xem logs chi tiết
sudo docker-compose logs -f app

# Kiểm tra environment variables
sudo docker-compose exec app env
```

## Bảo Mật

1. Đổi mật khẩu PostgreSQL mặc định
2. Sử dụng strong `NEXTAUTH_SECRET`
3. Cấu hình firewall đúng cách
4. Cập nhật hệ thống thường xuyên: `sudo apt update && sudo apt upgrade`
5. Backup database định kỳ
6. Sử dụng HTTPS (SSL certificate)
7. Giới hạn SSH login (disable root login, sử dụng SSH keys)

## Performance Optimization

1. Cấu hình Nginx caching
2. Sử dụng CDN cho static assets
3. Tối ưu database indexes
4. Monitor và scale resources khi cần

---

Chúc bạn deploy thành công! 🚀
