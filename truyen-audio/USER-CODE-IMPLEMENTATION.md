# User Code Implementation

## Tổng quan
Đã thêm trường `code` vào bảng User. Khi người dùng đăng ký mới, hệ thống tự động sinh mã code 9 ký tự ngẫu nhiên. Mã code này sẽ được dùng làm nội dung chuyển khoản khi mua VIP.

## Thay đổi

### 1. Database Schema
- **File**: `prisma/schema.prisma`
- **Thay đổi**: Thêm trường `code String? @unique` vào model User
- **Lưu ý**: Trường code là nullable để tương thích với user cũ

### 2. Code Generation Library
- **File**: `lib/user-code.ts`
- **Chức năng**:
  - `generateUserCode()`: Sinh mã 9 ký tự ngẫu nhiên (A-Z, 0-9)
  - `isValidUserCode()`: Validate format mã code
- **Format**: 9 ký tự viết hoa và số (ví dụ: `A3K9M2P7Q`)

### 3. User Registration
- **File**: `app/actions/auth.ts`
- **Thay đổi**: 
  - Import `generateUserCode` từ `lib/user-code.ts`
  - Tự động sinh code khi tạo user mới
  - Kiểm tra unique và regenerate nếu trùng (rất hiếm)

### 4. NextAuth Session
- **File**: `lib/auth.ts`
- **Thay đổi**:
  - Thêm `code` vào Session interface
  - Thêm `code` vào JWT interface
  - Include code trong authorize callback
  - Refresh code từ DB trong jwt callback
  - Pass code vào session callback

### 5. VIP Plans UI
- **File**: `app/(main)/vip/VipPlans.tsx`
- **Thay đổi**:
  - Thêm `code` vào user interface
  - Hiển thị `user.code` làm nội dung chuyển khoản
  - Loại bỏ dependency vào `transfer-content.ts`

### 6. VIP Page
- **File**: `app/(main)/vip/page.tsx`
- **Thay đổi**: Pass `code` từ session vào VipPlans component

### 7. Payment Action
- **File**: `app/actions/payment.ts`
- **Thay đổi**: Lưu user code vào payment note: `Mã CK: {code} - Chờ admin duyệt`

## Migration

### Bước 1: Chạy SQL để fix duplicate codes
```sql
-- File: scripts/fix-duplicate-codes.sql
ALTER TABLE "User" DROP COLUMN IF EXISTS "paymentCode";
UPDATE "User" SET "code" = NULL WHERE "code" = '';
```

### Bước 2: Push schema
```bash
cd truyen-audio
npx prisma db push
```

### Bước 3: Generate Prisma client
```bash
npx prisma generate
```

## Ví dụ

### User mới đăng ký
1. User đăng ký với email: `test@example.com`
2. Hệ thống tự động sinh code: `K7M3P9A2X`
3. Code được lưu vào database

### Mua VIP
1. User chọn gói VIP Tháng
2. Màn hình thanh toán hiển thị:
   - Nội dung CK: `K7M3P9A2X`
3. User chuyển khoản với nội dung: `K7M3P9A2X`
4. Admin xem payment note: `Mã CK: K7M3P9A2X - Chờ admin duyệt`

## Lưu ý quan trọng

1. **User cũ**: Các tài khoản đã tồn tại sẽ có `code = null`. Họ vẫn có thể sử dụng hệ thống bình thường.

2. **User mới**: Chỉ các tài khoản đăng ký sau khi deploy code này mới có mã code tự động.

3. **Unique constraint**: Mã code là unique, hệ thống sẽ tự động regenerate nếu trùng (xác suất rất thấp với 36^9 combinations).

4. **Format**: Mã code luôn là 9 ký tự viết hoa (A-Z) và số (0-9).

## Files đã tạo/sửa

### Tạo mới:
- `lib/user-code.ts` - Utility functions
- `scripts/add-user-code.sql` - Migration SQL
- `scripts/fix-duplicate-codes.sql` - Fix duplicate codes
- `USER-CODE-IMPLEMENTATION.md` - Documentation

### Đã sửa:
- `prisma/schema.prisma` - Thêm code field
- `app/actions/auth.ts` - Auto-generate code
- `lib/auth.ts` - Include code in session
- `app/(main)/vip/VipPlans.tsx` - Display code
- `app/(main)/vip/page.tsx` - Pass code
- `app/actions/payment.ts` - Save code in note

### Có thể xóa (không dùng nữa):
- `lib/transfer-content.ts` - Không còn sử dụng
- `lib/payment-code.ts` - Nếu có từ implementation cũ
