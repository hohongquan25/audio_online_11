# 🚀 HƯỚNG DẪN DEPLOY CHI TIẾT - DÀNH CHO NGƯỜI MỚI

> Bạn chỉ cần copy-paste các lệnh. Tôi sẽ giải thích từng bước!

---

## 📋 CHUẨN BỊ

Bạn cần có:
- ✅ Tài khoản Digital Ocean (đăng ký tại: https://digitalocean.com)
- ✅ Tài khoản GitHub (đăng ký tại: https://github.com)
- ✅ Gmail (để gửi email từ app)
- ✅ Thẻ tín dụng hoặc PayPal (để trả tiền Digital Ocean)

**Chi phí:** ~$12/tháng (~280,000 VNĐ)

---

## 🎯 PHẦN 1: PUSH CODE LÊN GITHUB

### Bước 1.1: Tạo Repository Trên GitHub

1. Mở trình duyệt, vào https://github.com
2. Đăng nhập
3. Click nút **"+"** góc trên bên phải → **"New repository"**
4. Điền thông tin:
   - **Repository name**: `truyen-audio`
   - **Description**: `Truyen Audio Website`
   - **Public** hoặc **Private**: Chọn tùy ý
   - **KHÔNG CHỌN** "Add a README file"
   - **KHÔNG CHỌN** ".gitignore"
   - **KHÔNG CHỌN** "license"
5. Click **"Create repository"**
6. **Giữ trang này mở**, bạn sẽ cần URL sau

### Bước 1.2: Push Code Từ Máy Local

Mở **Git Bash** hoặc **Terminal** trong thư mục dự án:

```bash
# Di chuyển vào thư mục truyen-audio
cd truyen-audio

# Kiểm tra xem đã có git chưa
git status

# Nếu chưa có git, khởi tạo
git init

# Add tất cả files
git add .

# Commit
git commit -m "Initial commit for deployment"

# Đổi branch thành main
git branch -M main

# Link với GitHub (THAY YOUR-USERNAME bằng username GitHub của bạn)
git remote add origin https://github.com/YOUR-USERNAME/truyen-audio.git

# Push code lên
git push -u origin main
```

**Nếu hỏi username/password:**
- Username: Nhập username GitHub của bạn
- Password: Nhập **Personal Access Token** (không phải password GitHub)

**Tạo Personal Access Token:**
1. Vào https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Note: `truyen-audio-deploy`
4. Chọn **"repo"** (tất cả các checkbox trong repo)
5. Click **"Generate token"**
6. **Copy token** và dùng làm password

✅ **Kiểm tra:** Refresh trang GitHub, bạn sẽ thấy code đã lên!

---

## 🎯 PHẦN 2: TẠO DROPLET TRÊN DIGITAL OCEAN

### Bước 2.1: Đăng Ký Digital Ocean

1. Vào https://cloud.digitalocean.com
2. Đăng ký tài khoản mới (nếu chưa có)
3. Xác thực email
4. Thêm phương thức thanh toán (thẻ tín dụng/PayPal)

### Bước 2.2: Tạo Droplet

1. Sau khi đăng nhập, click **"Create"** → **"Droplets"**

2. **Choose an image:**
   - Click tab **"OS"**
   - Chọn **"Ubuntu 22.04 (LTS) x64"**

3. **Choose Size:**
   - Click **"Basic"**
   - Click **"Regular"**
   - Chọn gói **$12/mo** (2 GB RAM / 1 CPU / 50 GB SSD)
   - ⚠️ Không chọn gói $6 vì RAM không đủ

4. **Choose a datacenter region:**
   - Chọn **"Singapore"** (gần Việt Nam nhất, tốc độ nhanh)

5. **Authentication:**
   - Chọn **"Password"** (dễ hơn cho người mới)
   - Nhập password mạnh (ít nhất 8 ký tự, có chữ hoa, số, ký tự đặc biệt)
   - **GHI NHỚ PASSWORD NÀY!**

6. **Finalize Details:**
   - Hostname: `truyen-audio-server`
   - Tags: để trống
   - Project: Default

7. Click **"Create Droplet"**

8. ⏳ Đợi 1-2 phút

9. ✅ Khi xong, bạn sẽ thấy Droplet với **IP address** (vd: 159.89.123.45)
   - **COPY IP NÀY** và lưu lại

---

## 🎯 PHẦN 3: KẾT NỐI VÀO SERVER

### Bước 3.1: Mở Terminal/Command Prompt

**Trên Windows:**
- Nhấn `Windows + R`
- Gõ `cmd` và Enter
- Hoặc dùng **Git Bash** (nếu đã cài Git)

**Trên Mac/Linux:**
- Mở **Terminal**

### Bước 3.2: SSH Vào Server

```bash
# Thay YOUR-DROPLET-IP bằng IP thực của bạn
ssh root@YOUR-DROPLET-IP
```

**Ví dụ:**
```bash
ssh root@159.89.123.45
```

**Sẽ hỏi:**
```
Are you sure you want to continue connecting (yes/no)?
```
→ Gõ `yes` và Enter

**Nhập password** (password bạn đã tạo ở bước 2.2)
- ⚠️ Khi gõ password, bạn sẽ KHÔNG THẤY gì trên màn hình (bình thường)
- Gõ xong nhấn Enter

✅ **Thành công khi thấy:**
```
root@truyen-audio-server:~#
```

---

## 🎯 PHẦN 4: CÀI ĐẶT DOCKER VÀ CÁC CÔNG CỤ

Copy-paste từng lệnh sau vào terminal (nhấn Enter sau mỗi lệnh):

### Bước 4.1: Update Hệ Thống

```bash
apt update && apt upgrade -y
```

⏳ Đợi 2-3 phút. Bạn sẽ thấy nhiều dòng chữ chạy.

### Bước 4.2: Cài Docker

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

⏳ Đợi 1-2 phút.

**Kiểm tra Docker đã cài:**
```bash
docker --version
```

✅ Bạn sẽ thấy: `Docker version 24.x.x`

### Bước 4.3: Cài Docker Compose

```bash
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

**Kiểm tra:**
```bash
docker-compose --version
```

✅ Bạn sẽ thấy: `Docker Compose version v2.x.x`

### Bước 4.4: Cài Nginx

```bash
apt install nginx -y
systemctl enable nginx
systemctl start nginx
```

**Kiểm tra:**
```bash
systemctl status nginx
```

✅ Bạn sẽ thấy: `Active: active (running)`

Nhấn `q` để thoát.

### Bước 4.5: Cài Git và Các Công Cụ Khác

```bash
apt install -y git curl wget nano certbot python3-certbot-nginx
```

### Bước 4.6: Setup Firewall

```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

**Kiểm tra:**
```bash
ufw status
```

✅ Bạn sẽ thấy ports 22, 80, 443 được allow.

---

## 🎯 PHẦN 5: CLONE CODE VỀ SERVER

### Bước 5.1: Tạo Thư Mục và Clone Code

```bash
# Tạo thư mục
mkdir -p /var/www
cd /var/www

# Clone code (THAY YOUR-USERNAME bằng username GitHub của bạn)
git clone https://github.com/YOUR-USERNAME/truyen-audio.git

# Vào thư mục app
cd cd /var/www/audio_online_11/truyen-audio


# Kiểm tra files
ls -la
```

✅ Bạn sẽ thấy các files: `package.json`, `Dockerfile`, `docker-compose.yml`, etc.

---

## 🎯 PHẦN 6: CẤU HÌNH ENVIRONMENT VARIABLES

### Bước 6.1: Tạo File .env.production

```bash
# Copy từ file example
cp .env.production.example .env.production

# Mở editor
nano .env.production
```

### Bước 6.2: Tạo NEXTAUTH_SECRET

**MỞ TAB TERMINAL MỚI** (giữ tab cũ), chạy lệnh:

```bash
openssl rand -base64 32
```

Bạn sẽ thấy một chuỗi như: `abc123xyz789...`

**COPY chuỗi này!**

### Bước 6.3: Lấy Gmail App Password

1. Mở trình duyệt, vào https://myaccount.google.com/security
2. Tìm **"2-Step Verification"** → Bật nó (nếu chưa bật)
3. Sau khi bật, quay lại trang Security
4. Tìm **"App passwords"** → Click vào
5. Chọn:
   - **App**: Mail
   - **Device**: Other → Gõ "Truyen Audio"
6. Click **"Generate"**
7. **COPY 16 ký tự** (vd: `abcd efgh ijkl mnop`)
8. **Xóa khoảng trắng** → `abcdefghijklmnop`

### Bước 6.4: Cập Nhật File .env.production

Quay lại terminal đang mở `nano`, cập nhật các giá trị:

```env
# Database - Thay password thành password mạnh của bạn
DATABASE_URL="postgresql://postgres:MySecurePass123@postgres:5432/truyen_audio?schema=public"
POSTGRES_PASSWORD="MySecurePass123"

# NextAuth - Paste NEXTAUTH_SECRET từ bước 6.2
NEXTAUTH_SECRET="paste-secret-o-day"

# NEXTAUTH_URL - Thay YOUR-DROPLET-IP bằng IP của bạn
NEXTAUTH_URL="http://YOUR-DROPLET-IP"

# SMTP - Thay bằng email và app password của bạn
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="abcdefghijklmnop"
SMTP_FROM="TruyệnAudio <your-email@gmail.com>"

NODE_ENV=production
```

**Ví dụ cụ thể:**
```env
DATABASE_URL="postgresql://postgres:MySecurePass123@postgres:5432/truyen_audio?schema=public"
POSTGRES_PASSWORD="MySecurePass123"
NEXTAUTH_SECRET="Kx7mP9nQ2rS5tU8vW1xY4zA6bC3dE0fG"
NEXTAUTH_URL="http://159.89.123.45"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="nguyenvana@gmail.com"
SMTP_PASS="abcdefghijklmnop"
SMTP_FROM="TruyệnAudio <nguyenvana@gmail.com>"
NODE_ENV=production
```

**Lưu file:**
1. Nhấn `Ctrl + X`
2. Nhấn `Y`
3. Nhấn `Enter`

---

## 🎯 PHẦN 7: BUILD VÀ DEPLOY

### Bước 7.1: Build và Start Containers

```bash
# Build và start
docker-compose up -d --build
```

⏳ Đợi 5-10 phút. Bạn sẽ thấy:
- Downloading images...
- Building...
- Creating containers...

✅ Khi xong, bạn sẽ thấy:
```
✔ Container truyen-audio-db    Started
✔ Container truyen-audio-app   Started
```

### Bước 7.2: Kiểm Tra Containers

```bash
docker-compose ps
```

✅ Bạn sẽ thấy:
```
NAME                  STATUS
truyen-audio-app      Up
truyen-audio-db       Up
```

### Bước 7.3: Xem Logs

```bash
docker-compose logs -f app
```

Đợi cho đến khi thấy:
```
✓ Ready in 3s
```

Nhấn `Ctrl + C` để thoát.

### Bước 7.4: Chạy Database Migrations

```bash
docker-compose exec app npx prisma migrate deploy
```

⏳ Đợi 30 giây.

✅ Bạn sẽ thấy: `Database migrations completed`

### Bước 7.5: Seed Database (Tạo Dữ Liệu Mẫu)

```bash
docker-compose exec app npm run seed
```

⏳ Đợi 1 phút.

✅ Bạn sẽ thấy: `Seeding completed`

---

## 🎯 PHẦN 8: CẤU HÌNH NGINX

### Bước 8.1: Cập Nhật Nginx Config

```bash
# Copy file config
cp nginx.conf /tmp/truyen-audio-nginx.conf

# Thay YOUR-DROPLET-IP bằng IP của bạn
sed -i "s/your-domain.com/168.144.41.45/g" /tmp/truyen-audio-nginx.conf
sed -i "s/www.your-domain.com/168.144.41.45/g" /tmp/truyen-audio-nginx.conf

# Copy vào nginx
cp /tmp/truyen-audio-nginx.conf /etc/nginx/sites-available/truyen-audio

# Xóa config mặc định
rm -f /etc/nginx/sites-enabled/default

# Enable site
ln -s /etc/nginx/sites-available/truyen-audio /etc/nginx/sites-enabled/

# Test config
nginx -t
```

✅ Bạn sẽ thấy: `test is successful`

### Bước 8.2: Restart Nginx

```bash
systemctl reload nginx
```

---

## 🎯 PHẦN 9: KIỂM TRA VÀ TRUY CẬP

### Bước 9.1: Test API

```bash
curl http://localhost:3000/api/health
```

✅ Bạn sẽ thấy: `{"status":"ok"}`

### Bước 9.2: Truy Cập Website

Mở trình duyệt, vào:
```
http://YOUR-DROPLET-IP
```

**Ví dụ:** `http://159.89.123.45`

🎉 **BạN SẼ THẤY TRANG CHỦ TRUYEN AUDIO!**

---

## 🎯 PHẦN 10: SETUP AUTO-RESTART

Để app tự động start khi server restart:

```bash
cat > /etc/systemd/system/truyen-audio.service <<EOF
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
EOF

systemctl daemon-reload
systemctl enable truyen-audio
```

✅ Done!

---

## 📊 CÁC LỆNH HỮU ÍCH

### Xem logs realtime:
```bash
cd /var/www/truyen-audio/truyen-audio
docker-compose logs -f app
```

### Restart app:
```bash
docker-compose restart app
```

### Stop app:
```bash
docker-compose down
```

### Start app:
```bash
docker-compose up -d
```

### Xem resource usage:
```bash
docker stats
```

### Backup database:
```bash
docker-compose exec postgres pg_dump -U postgres truyen_audio > backup_$(date +%Y%m%d).sql
```

---

## 🔄 CẬP NHẬT CODE MỚI

Khi bạn có code mới:

### Trên máy local:
```bash
git add .
git commit -m "Update features"
git push origin main
```

### Trên server:
```bash
cd /var/www/truyen-audio/truyen-audio
git pull origin main
docker-compose up -d --build
docker-compose exec app npx prisma migrate deploy
```

---

## 🆘 TROUBLESHOOTING

### Lỗi: Cannot connect to database
```bash
docker-compose restart postgres
docker-compose logs postgres
```

### Lỗi: Port already in use
```bash
docker-compose down
docker-compose up -d
```

### Website không load
```bash
# Kiểm tra app
docker-compose ps

# Xem logs
docker-compose logs app

# Kiểm tra nginx
systemctl status nginx
```

### Quên password SSH
- Vào Digital Ocean Console
- Click Droplet → Access → Reset Root Password

---

## 🎉 HOÀN TẤT!

Bạn đã deploy thành công! 

**Những gì bạn đã làm:**
- ✅ Push code lên GitHub
- ✅ Tạo Droplet Ubuntu
- ✅ Cài Docker, Nginx
- ✅ Clone code và cấu hình
- ✅ Deploy với Docker Compose
- ✅ Setup Nginx reverse proxy
- ✅ Website đang chạy!

**Chi phí:** $12/tháng (~280,000 VNĐ)

**Cần hỗ trợ?** Hỏi tôi bất cứ lúc nào!
