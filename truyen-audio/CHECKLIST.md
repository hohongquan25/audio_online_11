# ✅ CHECKLIST DEPLOY - IN RA VÀ ĐÁNH DẤU

In trang này ra và đánh dấu ✓ khi hoàn thành mỗi bước!

---

## 📋 PHẦN 1: CHUẨN BỊ

- [ ] Đã có tài khoản Digital Ocean
- [ ] Đã có tài khoản GitHub
- [ ] Đã có Gmail
- [ ] Đã có thẻ tín dụng/PayPal
- [ ] Đã đọc file HUONG-DAN-CHI-TIET.md

---

## 📋 PHẦN 2: PUSH CODE LÊN GITHUB

- [ ] Đã tạo repository trên GitHub tên `truyen-audio`
- [ ] Đã chạy `git init` trong thư mục truyen-audio
- [ ] Đã chạy `git add .`
- [ ] Đã chạy `git commit -m "Initial commit"`
- [ ] Đã chạy `git remote add origin ...`
- [ ] Đã chạy `git push -u origin main`
- [ ] Đã thấy code trên GitHub

**GitHub URL của tôi:**
```
https://github.com/_______________/truyen-audio
```

---

## 📋 PHẦN 3: TẠO DROPLET

- [ ] Đã đăng nhập Digital Ocean
- [ ] Đã chọn Ubuntu 22.04 LTS
- [ ] Đã chọn gói $12/month (2GB RAM)
- [ ] Đã chọn region Singapore
- [ ] Đã tạo password mạnh
- [ ] Đã click "Create Droplet"
- [ ] Đã copy IP address

**IP Droplet của tôi:**
```
_____._____._____._____ (vd: 159.89.123.45)
```

**Password SSH của tôi:**
```
_________________________________
```

---

## 📋 PHẦN 4: KẾT NỐI SSH

- [ ] Đã mở Terminal/CMD
- [ ] Đã chạy `ssh root@YOUR-DROPLET-IP`
- [ ] Đã gõ `yes` khi hỏi
- [ ] Đã nhập password
- [ ] Đã thấy prompt `root@truyen-audio-server:~#`

---

## 📋 PHẦN 5: CÀI ĐẶT DOCKER

- [ ] Đã chạy `apt update && apt upgrade -y`
- [ ] Đã chạy `curl -fsSL https://get.docker.com -o get-docker.sh`
- [ ] Đã chạy `sh get-docker.sh`
- [ ] Đã chạy `docker --version` và thấy kết quả
- [ ] Đã cài Docker Compose
- [ ] Đã chạy `docker-compose --version` và thấy kết quả

---

## 📋 PHẦN 6: CÀI NGINX VÀ CÔNG CỤ

- [ ] Đã chạy `apt install nginx -y`
- [ ] Đã chạy `systemctl enable nginx`
- [ ] Đã chạy `systemctl start nginx`
- [ ] Đã chạy `apt install -y git curl wget nano certbot python3-certbot-nginx`
- [ ] Đã setup firewall với ufw

---

## 📋 PHẦN 7: CLONE CODE

- [ ] Đã chạy `mkdir -p /var/www`
- [ ] Đã chạy `cd /var/www`
- [ ] Đã chạy `git clone https://github.com/YOUR-USERNAME/truyen-audio.git`
- [ ] Đã chạy `cd truyen-audio/truyen-audio`
- [ ] Đã chạy `ls -la` và thấy files

---

## 📋 PHẦN 8: CẤU HÌNH ENVIRONMENT

- [ ] Đã chạy `cp .env.production.example .env.production`
- [ ] Đã tạo NEXTAUTH_SECRET bằng `openssl rand -base64 32`
- [ ] Đã lấy Gmail App Password
- [ ] Đã mở `nano .env.production`
- [ ] Đã cập nhật DATABASE_URL
- [ ] Đã cập nhật POSTGRES_PASSWORD
- [ ] Đã cập nhật NEXTAUTH_SECRET
- [ ] Đã cập nhật NEXTAUTH_URL với IP của mình
- [ ] Đã cập nhật SMTP_USER
- [ ] Đã cập nhật SMTP_PASS
- [ ] Đã cập nhật SMTP_FROM
- [ ] Đã save file (Ctrl+X, Y, Enter)

**NEXTAUTH_SECRET của tôi:**
```
_________________________________
```

**Gmail App Password của tôi:**
```
_________________________________
```

---

## 📋 PHẦN 9: BUILD VÀ DEPLOY

- [ ] Đã chạy `docker-compose up -d --build`
- [ ] Đã đợi 5-10 phút
- [ ] Đã chạy `docker-compose ps` và thấy containers Up
- [ ] Đã chạy `docker-compose logs -f app` và thấy "Ready"
- [ ] Đã chạy `docker-compose exec app npx prisma migrate deploy`
- [ ] Đã chạy `docker-compose exec app npm run seed`

---

## 📋 PHẦN 10: CẤU HÌNH NGINX

- [ ] Đã copy nginx.conf
- [ ] Đã thay YOUR-DROPLET-IP bằng IP thực
- [ ] Đã copy vào /etc/nginx/sites-available/
- [ ] Đã xóa default site
- [ ] Đã enable site
- [ ] Đã chạy `nginx -t` và thấy "successful"
- [ ] Đã chạy `systemctl reload nginx`

---

## 📋 PHẦN 11: KIỂM TRA

- [ ] Đã chạy `curl http://localhost:3000/api/health`
- [ ] Đã thấy `{"status":"ok"}`
- [ ] Đã mở browser
- [ ] Đã vào `http://YOUR-DROPLET-IP`
- [ ] Đã thấy trang chủ Truyen Audio! 🎉

---

## 📋 PHẦN 12: AUTO-RESTART

- [ ] Đã tạo systemd service
- [ ] Đã chạy `systemctl enable truyen-audio`

---

## 🎉 HOÀN TẤT!

- [ ] Website đang chạy
- [ ] Đã test đăng ký/đăng nhập
- [ ] Đã test các tính năng chính
- [ ] Đã lưu lại tất cả thông tin quan trọng

---

## 📝 THÔNG TIN QUAN TRỌNG - LƯU LẠI

**IP Droplet:**
```
_________________________________
```

**SSH Password:**
```
_________________________________
```

**Database Password:**
```
_________________________________
```

**GitHub Repo:**
```
https://github.com/_______________/truyen-audio
```

**Website URL:**
```
http://_________________________________
```

---

## 🆘 NẾU GẶP LỖI

Ghi lại lỗi ở đây:
```
_________________________________
_________________________________
_________________________________
```

Xem phần Troubleshooting trong HUONG-DAN-CHI-TIET.md
