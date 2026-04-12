# 📝 Hướng Dẫn Chi Tiết Từng Bước - Droplet Deploy

## ✅ Checklist Chuẩn Bị

- [ ] Tài khoản Digital Ocean
- [ ] Tài khoản GitHub (để lưu code)
- [ ] Gmail App Password (cho SMTP)
- [ ] Domain name (tùy chọn)

---

## 🎯 BƯỚC 1: Tạo Droplet

1. Đăng nhập https://cloud.digitalocean.com
2. Click **Create** → **Droplets**
3. Chọn cấu hình:
   ```
   Image: Ubuntu 22.04 LTS
   Plan: Basic
   CPU: Regular - $12/month (2GB RAM) ← Khuyến nghị
        hoặc $6/month (1GB RAM) nếu tiết kiệm
   Region: Singapore
   ```
4. **Authentication**:
   - Chọn **Password** → Nhập password mạnh
   - Hoặc **SSH Key** (bảo mật hơn)
5. **Hostname**: `truyen-audio-server`
6. Click **Create Droplet**
7. ⏳ Đợi 1-2 phút
8. 📝 **Copy IP address** của Droplet (vd: 159.89.123.45)

---

## 🎯 BƯỚC 2: Push Code Lên GitHub

Trên máy local của bạn (Windows):

```bash
# Mở terminal trong thư mục truyen-audio
cd truyen-audio

# Khởi tạo Git (nếu chưa có)
git init

# Add tất cả files
git add .

# Commit
git commit -m "Initial commit for deployment"

# Tạo repo trên GitHub
# Vào https://github.com/new
# Tạo repo mới tên "truyen-audio"
# Không chọn README, .gitignore hay license

# Link với GitHub (thay YOUR-USERNAME)
git remote add origin https://github.com/YOUR-USERNAME/truyen-audio.git
git branch -M main
git push -u origin main
```

---

## 🎯 BƯỚC 3: Kết Nối SSH Vào Droplet

```bash
# Thay YOUR-DROPLET-IP bằng IP thực của bạn
ssh root@YOUR-DROPLET-IP

# Nhập password nếu được hỏi
# Lần đầu sẽ hỏi "Are you sure...?" → gõ "yes"
```

Bạn sẽ thấy prompt như: `root@truyen-audio-server:~#`

---

## 🎯 BƯỚC 4: Setup Server

Trên server (sau khi SSH vào):

```bash
# Download script setup
curl -o setup-server.sh https://raw.githubusercontent.com/YOUR-USERNAME/truyen-audio/main/truyen-audio/setup-server.sh

# Hoặc tạo file thủ công:
nano setup-server.sh
# Copy nội dung từ file setup-server.sh vào
# Ctrl+X, Y, Enter để save

# Chạy script
chmod +x setup-server.sh
./setup-server.sh
```

Script sẽ tự động:
- ✅ Update hệ thống
- ✅ Cài Docker & Docker Compose
- ✅ Cài Nginx
- ✅ Cài Certbot (cho SSL)
- ✅ Setup firewall
- ✅ Tạo thư mục /var/www

⏳ Đợi 3-5 phút để hoàn tất.

---

## 🎯 BƯỚC 5: Clone Code Về Server

```bash
# Di chuyển vào thư mục
cd /var/www

# Clone code từ GitHub (thay YOUR-USERNAME)
git clone https://github.com/YOUR-USERNAME/truyen-audio.git

# Vào thư mục app
cd truyen-audio/truyen-audio

# Kiểm tra files
ls -la
```

Bạn sẽ thấy các files: `package.json`, `Dockerfile`, `docker-compose.yml`, etc.

---

## 🎯 BƯỚC 6: Cấu Hình Environment Variables

```bash
# Tạo file .env.production
cp .env.production.example .env.production

# Mở editor
nano .env.production
```

Cập nhật các giá trị sau:

```env
# Database - Giữ nguyên, Docker sẽ tự tạo
DATABASE_URL="postgresql://postgres:MySecurePass123@postgres:5432/truyen_audio?schema=public"
POSTGRES_PASSWORD="MySecurePass123"

# NextAuth - Tạo secret mới
NEXTAUTH_SECRET="paste-secret-here"
NEXTAUTH_URL="http://YOUR-DROPLET-IP"

# SMTP - Thông tin Gmail của bạn
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-gmail-app-password"
SMTP_FROM="TruyệnAudio <your-email@gmail.com>"

NODE_ENV=production
```

**Tạo NEXTAUTH_SECRET:**
```bash
# Chạy lệnh này để tạo secret
openssl rand -base64 32

# Copy kết quả và paste vào NEXTAUTH_SECRET
```

**Lấy Gmail App Password:**
1. Vào https://myaccount.google.com/security
2. Bật "2-Step Verification"
3. Vào "App passwords"
4. Tạo password mới cho "Mail"
5. Copy 16 ký tự và paste vào SMTP_PASS

**Lưu file:**
- Nhấn `Ctrl + X`
- Nhấn `Y`
- Nhấn `Enter`

---

## 🎯 BƯỚC 7: Deploy Application

```bash
# Chạy script setup tự động
chmod +x setup-app.sh
./setup-app.sh
```

Script sẽ hỏi một số câu hỏi:
1. **"Bạn có muốn tự động thêm NEXTAUTH_SECRET?"** → Gõ `y`
2. **"Bạn có domain không?"** → Gõ `n` (nếu chưa có) hoặc `y` và nhập domain
3. **"Seed database với dữ liệu mẫu?"** → Gõ `y`
4. **"Cài SSL certificate?"** → Gõ `n` nếu dùng IP, `y` nếu có domain

⏳ Đợi 5-10 phút để build và deploy.

---

## 🎯 BƯỚC 8: Kiểm Tra Kết Quả

### Kiểm tra containers đang chạy:
```bash
docker-compose ps
```

Bạn sẽ thấy:
```
NAME                  STATUS
truyen-audio-app      Up
truyen-audio-db       Up
```

### Xem logs:
```bash
docker-compose logs -f app
```

Nhấn `Ctrl + C` để thoát.

### Kiểm tra Nginx:
```bash
systemctl status nginx
```

### Test ứng dụng:
```bash
curl http://localhost:3000/api/health
```

Nếu thấy `{"status":"ok"}` → Thành công! ✅

---

## 🎯 BƯỚC 9: Truy Cập Website

Mở browser và truy cập:
```
http://YOUR-DROPLET-IP
```

Ví dụ: `http://159.89.123.45`

Bạn sẽ thấy trang chủ của Truyen Audio! 🎉

---

## 🎯 BƯỚC 10: Cài SSL (HTTPS) - Nếu Có Domain

### Cấu hình DNS:
1. Vào nhà cung cấp domain (GoDaddy, Namecheap, etc.)
2. Thêm A Record:
   ```
   Type: A
   Name: @
   Value: YOUR-DROPLET-IP
   TTL: 3600
   ```
3. Thêm A Record cho www:
   ```
   Type: A
   Name: www
   Value: YOUR-DROPLET-IP
   TTL: 3600
   ```
4. Đợi 5-30 phút để DNS propagate

### Cài SSL Certificate:
```bash
# Trên server
certbot --nginx -d your-domain.com -d www.your-domain.com

# Làm theo hướng dẫn:
# - Nhập email
# - Agree to terms: Y
# - Share email: N
# - Redirect HTTP to HTTPS: 2
```

### Cập nhật NEXTAUTH_URL:
```bash
nano .env.production

# Đổi từ:
NEXTAUTH_URL="http://your-domain.com"
# Thành:
NEXTAUTH_URL="https://your-domain.com"

# Save và restart
docker-compose restart app
```

Giờ truy cập: `https://your-domain.com` 🔒

---

## 📊 Các Lệnh Quản Lý Hữu Ích

```bash
# Xem logs realtime
docker-compose logs -f app

# Xem logs database
docker-compose logs -f postgres

# Restart application
docker-compose restart app

# Stop tất cả
docker-compose down

# Start lại
docker-compose up -d

# Xem resource usage
docker stats

# Xem disk space
df -h
```

---

## 🔄 Cập Nhật Code Mới

Khi bạn có code mới:

```bash
# Trên máy local
git add .
git commit -m "Update features"
git push origin main

# Trên server
cd /var/www/truyen-audio/truyen-audio
git pull origin main
docker-compose up -d --build
docker-compose exec app npx prisma migrate deploy
```

---

## 💾 Backup Database

```bash
# Tạo backup
docker-compose exec postgres pg_dump -U postgres truyen_audio > backup_$(date +%Y%m%d).sql

# Download về máy local (chạy trên máy local)
scp root@YOUR-DROPLET-IP:/var/www/truyen-audio/truyen-audio/backup_*.sql ./

# Restore backup (nếu cần)
docker-compose exec -T postgres psql -U postgres truyen_audio < backup_20240101.sql
```

---

## 🆘 Troubleshooting

### Lỗi: "Cannot connect to database"
```bash
# Kiểm tra database đang chạy
docker-compose ps postgres

# Xem logs database
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Lỗi: "Port 3000 already in use"
```bash
# Tìm process đang dùng port 3000
lsof -i :3000

# Kill process
kill -9 PID_NUMBER

# Hoặc restart Docker
docker-compose down
docker-compose up -d
```

### Lỗi: "Nginx 502 Bad Gateway"
```bash
# Kiểm tra app đang chạy
docker-compose ps app

# Xem logs
docker-compose logs app

# Restart
docker-compose restart app
```

### Website chậm
```bash
# Kiểm tra resource usage
docker stats

# Nếu RAM/CPU cao → Cần upgrade Droplet
# Vào Digital Ocean → Droplet → Resize
```

---

## 🎉 Hoàn Tất!

Bạn đã deploy thành công ứng dụng lên Digital Ocean!

**Các bước đã làm:**
- ✅ Tạo Droplet
- ✅ Setup server với Docker, Nginx
- ✅ Clone code từ GitHub
- ✅ Cấu hình environment
- ✅ Deploy với Docker Compose
- ✅ Setup Nginx reverse proxy
- ✅ (Tùy chọn) Cài SSL certificate

**Chi phí:** ~$6-12/tháng

**Cần hỗ trợ?** Xem file DIGITALOCEAN-DEPLOY.md để biết thêm chi tiết!
