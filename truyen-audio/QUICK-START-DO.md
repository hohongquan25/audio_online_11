# 🚀 Quick Start - Deploy Lên Digital Ocean

## Cách Nhanh Nhất (5 phút)

### 1️⃣ Tạo Database
1. Vào https://cloud.digitalocean.com/databases
2. Click **Create Database**
3. Chọn **PostgreSQL 15**, plan **Development** ($7/tháng)
4. Region: **Singapore**
5. Click **Create Database Cluster**
6. Đợi 2-3 phút, sau đó copy **Connection String**

### 2️⃣ Push Code Lên GitHub
```bash
cd truyen-audio
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/truyen-audio.git
git push -u origin main
```

### 3️⃣ Deploy App
1. Vào https://cloud.digitalocean.com/apps
2. Click **Create App**
3. Chọn **GitHub** → Authorize → Chọn repo `truyen-audio`
4. **Source Directory**: `/truyen-audio`
5. Click **Next**

### 4️⃣ Thêm Environment Variables
Click **Edit** bên cạnh Environment Variables, thêm:

```
DATABASE_URL = (paste connection string từ bước 1)
NEXTAUTH_SECRET = (chạy: openssl rand -base64 32)
NEXTAUTH_URL = https://truyen-audio-xxxxx.ondigitalocean.app
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_USER = your-email@gmail.com
SMTP_PASS = your-gmail-app-password
SMTP_FROM = TruyệnAudio <your-email@gmail.com>
NODE_ENV = production
```

### 5️⃣ Deploy
1. Chọn plan **Basic - $5/month**
2. Click **Create Resources**
3. Đợi 5-10 phút
4. Xong! 🎉

### 6️⃣ Chạy Migration
1. Vào app → Tab **Console**
2. Chạy:
```bash
npx prisma migrate deploy
npm run seed
```

---

## Cách Rẻ Nhất (Droplet - $6/tháng)

### 1️⃣ Tạo Droplet
1. Vào https://cloud.digitalocean.com/droplets
2. Click **Create Droplet**
3. Chọn **Ubuntu 22.04**, **Basic $6/month**
4. Region: **Singapore**
5. Add SSH Key hoặc dùng Password
6. Click **Create Droplet**

### 2️⃣ SSH vào Server
```bash
ssh root@YOUR-DROPLET-IP
```

### 3️⃣ Chạy Script Tự Động
```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Clone code
cd /var/www
git clone https://github.com/YOUR-USERNAME/truyen-audio.git
cd truyen-audio/truyen-audio

# Setup environment
cp .env.production.example .env.production
nano .env.production  # Sửa thông tin

# Deploy
chmod +x deploy.sh
./deploy.sh

# Install Nginx
apt install nginx -y
cp nginx.conf /etc/nginx/sites-available/truyen-audio
ln -s /etc/nginx/sites-available/truyen-audio /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# Setup firewall
ufw allow 22,80,443/tcp
ufw enable
```

### 4️⃣ Truy Cập
Mở browser: `http://YOUR-DROPLET-IP`

---

## 📊 So Sánh

| Tính năng | App Platform | Droplet |
|-----------|--------------|---------|
| Giá | $12-27/tháng | $6/tháng |
| Setup | 5 phút | 15 phút |
| Quản lý | Tự động | Thủ công |
| Scale | Dễ dàng | Khó hơn |
| Backup | Tự động | Thủ công |

**Khuyến nghị:**
- Mới bắt đầu → **App Platform**
- Tiết kiệm chi phí → **Droplet**

---

## 🆘 Cần Giúp?

Xem hướng dẫn chi tiết: **DIGITALOCEAN-DEPLOY.md**
