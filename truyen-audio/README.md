# Truyện Audio

Nền tảng nghe truyện audio trực tuyến — xây dựng bằng Next.js 16, hỗ trợ nghe truyện miễn phí và VIP, cộng đồng thảo luận, đánh giá truyện, và quản trị nội dung.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Ngôn ngữ:** TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** NextAuth.js v5 (Auth.js) — JWT strategy
- **Styling:** TailwindCSS 4
- **Validation:** Zod
- **Testing:** Vitest, fast-check, Testing Library

## Yêu cầu hệ thống

- Node.js >= 18
- PostgreSQL >= 14
- npm >= 9

## Cài đặt

### 1. Clone repository

```bash
git clone <repository-url>
cd truyen-audio
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình biến môi trường

Tạo file `.env` từ mẫu:

```bash
cp .env.example .env
```

Mở file `.env` và cập nhật `DATABASE_URL` theo thông tin PostgreSQL của bạn:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/truyen_audio?schema=public"

NEXTAUTH_SECRET="your-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

> Đảm bảo database `truyen_audio` đã được tạo trong PostgreSQL trước khi chạy migration.

### 4. Chạy migration

```bash
npx prisma migrate dev --name init
```

### 5. Seed dữ liệu mẫu

```bash
npm run seed
```

### 6. Chạy dev server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

## Tài khoản mẫu

Sau khi seed, bạn có thể đăng nhập với các tài khoản sau:

| Email              | Mật khẩu | Role |
| ------------------ | --------- | ---- |
| user@example.com   | 123456    | USER |
| vip@example.com    | 123456    | VIP  |

## Scripts

| Lệnh             | Mô tả                          |
| ----------------- | ------------------------------- |
| `npm run dev`     | Chạy dev server (localhost:3000)|
| `npm run build`   | Build production                |
| `npm run start`   | Chạy production server          |
| `npm run lint`    | Kiểm tra linting (ESLint)       |
| `npm run test`    | Chạy test suite (Vitest)        |
| `npm run seed`    | Seed dữ liệu mẫu vào database  |

## Cấu trúc dự án

```
truyen-audio/
├── app/
│   ├── (auth)/              # Trang đăng nhập, đăng ký, quên mật khẩu
│   ├── (main)/              # Trang chính: trang chủ, truyện, cộng đồng, VIP, profile
│   ├── admin/               # Trang quản trị (chỉ ADMIN)
│   ├── api/                 # API routes (stories, episodes, posts, payments, ratings)
│   └── actions/             # Server Actions (auth, stories, community, payment, listening)
├── components/
│   ├── audio/               # AudioPlayer
│   ├── auth/                # LoginForm, RegisterForm
│   ├── community/           # PostCard, PostForm, CommentSection
│   ├── layout/              # Header, Footer, ThemeToggle
│   ├── stories/             # StoryCard, StoryGrid, StoryFilter, EpisodeList, StarRating
│   └── ui/                  # Button, Input, Card, Modal
├── lib/                     # Auth config, Prisma client, validations, utils
├── prisma/                  # Schema và seed data
├── types/                   # TypeScript type definitions
└── middleware.ts            # Route protection và VIP expiry check
```
