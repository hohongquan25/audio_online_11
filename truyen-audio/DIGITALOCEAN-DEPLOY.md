# Hướng Dẫn Deploy Lên Digital Ocean

## 🎯 Các Phương Án Deploy

Digital Ocean cung cấp nhiều cách để deploy ứng dụng Next.js:

1. **App Platform** (Khuyến nghị - Dễ nhất, tự động scale)
2. **Droplet + Docker** (Linh hoạt, giá rẻ hơn)
3. **Kubernetes** (Cho ứng dụng lớn)

---

## 🚀 PHƯƠNG ÁN 1: Digital Ocean App Platform (Khuyến nghị)

Đây là cách dễ nhất, Digital Ocean tự động build, deploy và scale cho bạn.

### Bước 1: Chuẩn Bị Database

1. Đăng nhập vào [Digital Ocean Console](https://cloud.digitalocean.com/)
2. Vào **Databases** → **Create Database Cluster**
3. Chọn:
   - **PostgreSQL** version 15
   - **Basic** plan ($15/tháng) hoặc **Development** ($7/tháng cho dev)
   - **Region**: Singapore hoặc gần Việt Nam nhất
   - **Database name**: `truyen_audio`
4. Sau khi tạo xong, copy **Connection String**

### Bước 2: Push Code Lên GitHub

```bash
# Nếu chưa có Git repo
cd truyen-audio
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/truyen-audio.git
git push -u origin main
```

### Bước 3: Tạo App Platform

1. Vào **Apps** → **Create App**
2. Chọn **GitHub** → Authorize và chọn repository `truyen-audio`
3. Cấu hình:
   - **Source Directory**: `/truyen-audio`
   - **Branch**: `main`
   - **Autodeploy**: Bật (tự động deploy khi push code)

### Bước 4: Cấu Hình Build Settings

Trong phần **Build and Deployment**:

- **Build Command**: `npm run build`
- **Run Command**: `npm start`
- **HTTP Port**: `3000`
- **Environment**: `Node.js`

### Bước 5: Thêm Environment Variables

Trong phần **Environment Variables**, thêm:

```
DATABASE_URL=postgresql://user:password@host:25060/truyen_audio?sslmode=require
NEXTAUTH_SECRET=your-generated-secret
NEXTAUTH_URL=https://your-app.ondigitalocean.app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=TruyệnAudio <your-email@gmail.com>
NODE_ENV=production
```

**Lấy DATABASE_URL từ Digital Ocean Database:**
- Vào Database → **Connection Details** → Copy **Connection String**

**Tạo NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### Bước 6: Chọn Plan và Deploy

1. Chọn plan:
   - **Basic**: $5/tháng (512MB RAM, 1 vCPU) - Đủ cho bắt đầu
   - **Professional**: $12/tháng (1GB RAM, 1 vCPU) - Tốt hơn
2. Click **Create Resources**
3. Đợi 5-10 phút để build và deploy

### Bước 7: Chạy Database Migrations

Sau khi app deploy xong:

1. Vào **Console** tab trong App Platform
2. Chạy lệnh:
```bash
npx prisma migrate deploy
npx prisma db seed  # Nếu muốn seed data
```

### Bước 8: Cấu Hình Custom Domain (Tùy chọn)

1. Vào **Settings** → **Domains**
2. Click **Add Domain**
3. Nhập domain của bạn: `truyenaudio.com`
4. Cập nhật DNS records theo hướng dẫn:
   - **Type**: CNAME
   - **Name**: @ hoặc www
   - **Value**: your-app.ondigitalocean.app

### Cập Nhật Code Mới

Chỉ cần push lên GitHub, App Platform tự động deploy:
```bash
git add .
git commit -m "Update features"
git push origin main
```

### Xem Logs và Monitor

- **Runtime Logs**: Tab **Runtime Logs** trong App Platform
- **Metrics**: Tab **Insights** để xem CPU, RAM, requests

---

## 💻 PHƯƠNG ÁN 2: Droplet + Docker (Giá Rẻ Hơn)

Phù hợp nếu bạn muốn kiểm soát nhiều hơn và tiết kiệm chi phí.

### Bước 1: Tạo Droplet

1. Vào **Droplets** → **Create Droplet**
2. Chọn:
   - **Image**: Ubuntu 22.04 LTS
   - **Plan**: Basic
   - **CPU Options**: Regular ($6/tháng - 1GB RAM) hoặc Premium ($12/tháng - 2GB RAM)
   - **Region**: Singapore
   - **Authentication**: SSH Key (khuyến nghị) hoặc Password
   - **Hostname**: `truyen-audio-server`

3. Click **Create Droplet**

### Bước 2: Kết Nối SSH

```bash
ssh root@your-droplet-ip
```

### Bước 3: Cài Đặt Docker và Docker Compose

```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Verify
docker --version
docker-compose --version
```

### Bước 4: Upload Code

**Cách 1: Dùng Git (Khuyến nghị)**
```bash
cd /var/www
git clone https://github.com/your-username/truyen-audio.git
cd truyen-audio/truyen-audio
```

**Cách 2: Dùng SCP từ máy local**
```bash
# Trên máy local
scp -r truyen-audio root@your-droplet-ip:/var/www/
```

### Bước 5: Cấu Hình Environment

```bash
cd /var/www/truyen-audio/truyen-audio

# Tạo file .env.production
cp .env.production.example .env.production
nano .env.production
```

Cập nhật nội dung:
```env
DATABASE_URL="postgresql://postgres:your-password@postgres:5432/truyen_audio?schema=public"
POSTGRES_PASSWORD="your-secure-password"
NEXTAUTH_SECRET="your-generated-secret"
NEXTAUTH_URL="http://your-droplet-ip:3000"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="TruyệnAudio <your-email@gmail.com>"
NODE_ENV=production
```

### Bước 6: Deploy với Docker Compose

```bash
# Build và start
docker-compose up -d --build

# Xem logs
docker-compose logs -f

# Chạy migrations
docker-compose exec app npx prisma migrate deploy

# Seed database (tùy chọn)
docker-compose exec app npm run seed
```

### Bước 7: Cài Nginx

```bash
# Install Nginx
apt install nginx -y

# Copy config
cp nginx.conf /etc/nginx/sites-available/truyen-audio

# Sửa domain trong config
nano /etc/nginx/sites-available/truyen-audio
# Thay your-domain.com bằng IP hoặc domain của bạn

# Enable site
ln -s /etc/nginx/sites-available/truyen-audio /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default  # Xóa config mặc định

# Test và reload
nginx -t
systemctl reload nginx
```

### Bước 8: Cấu Hình Firewall

```bash
# Enable firewall
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable

# Check status
ufw status
```

### Bước 9: Cài SSL Certificate

```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get certificate (thay your-domain.com)
certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal đã được setup tự động
```

### Bước 10: Setup Auto-restart

```bash
# Tạo systemd service
nano /etc/systemd/system/truyen-audio.service
```

Nội dung:
```ini
[Unit]
Description=Truyen Audio Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/var/www/truyen-audio/truyen-audio
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

Enable service:
```bash
systemctl enable truyen-audio
systemctl start truyen-audio
```

---

## 🔧 Quản Lý và Bảo Trì

### Cập Nhật Code Mới (Droplet)

```bash
cd /var/www/truyen-audio/truyen-audio
git pull origin main
docker-compose up -d --build
docker-compose exec app npx prisma migrate deploy
```

### Backup Database

**App Platform:**
- Digital Ocean tự động backup database hàng ngày
- Vào Database → **Backups** để restore

**Droplet:**
```bash
# Backup
docker-compose exec postgres pg_dump -U postgres truyen_audio > backup_$(date +%Y%m%d).sql

# Restore
docker-compose exec -T postgres psql -U postgres truyen_audio < backup_20240101.sql
```

### Monitor Resources

**App Platform:**
- Vào **Insights** tab để xem metrics

**Droplet:**
```bash
# Xem resource usage
docker stats

# Xem disk space
df -h

# Xem logs
docker-compose logs -f app
```

### Scale Up

**App Platform:**
- Vào **Settings** → **Resources** → Chọn plan lớn hơn

**Droplet:**
- Vào Droplet → **Resize** → Chọn plan lớn hơn

---

## 💰 So Sánh Chi Phí

### App Platform
- **App**: $5-12/tháng
- **Database**: $7-15/tháng
- **Tổng**: ~$12-27/tháng
- **Ưu điểm**: Dễ dàng, tự động scale, không cần quản lý server
- **Nhược điểm**: Đắt hơn một chút

### Droplet + Docker
- **Droplet**: $6-12/tháng (bao gồm cả database)
- **Tổng**: ~$6-12/tháng
- **Ưu điểm**: Rẻ hơn, kiểm soát hoàn toàn
- **Nhược điểm**: Cần quản lý server, setup phức tạp hơn

---

## 🎯 Khuyến Nghị

### Cho Người Mới Bắt Đầu
→ Dùng **App Platform** - Dễ dàng, ít lo lắng về infrastructure

### Cho Developer Có Kinh Nghiệm
→ Dùng **Droplet + Docker** - Tiết kiệm chi phí, linh hoạt hơn

### Cho Production Lớn
→ Dùng **App Platform** với **Managed Database** - Đáng tin cậy, dễ scale

---

## 🆘 Troubleshooting

### App Platform build failed
- Kiểm tra **Build Logs**
- Đảm bảo `package.json` có đúng scripts
- Kiểm tra Node version compatibility

### Database connection error
- Kiểm tra `DATABASE_URL` có đúng format
- Đảm bảo database đã tạo
- Kiểm tra firewall rules

### App không start
- Xem **Runtime Logs**
- Kiểm tra environment variables
- Đảm bảo port 3000 được expose

---

## 📚 Tài Nguyên Hữu Ích

- [Digital Ocean Docs](https://docs.digitalocean.com/)
- [App Platform Guide](https://docs.digitalocean.com/products/app-platform/)
- [Droplet Tutorials](https://www.digitalocean.com/community/tutorials)

Chúc bạn deploy thành công! 🚀
