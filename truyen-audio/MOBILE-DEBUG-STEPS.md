# Mobile Debug Steps - iPhone 11

## Bước 1: Rebuild và Clear Cache

```bash
# Stop dev server (Ctrl+C)
# Clear Next.js cache
rm -rf truyen-audio/.next

# Rebuild
cd truyen-audio
npm run dev
```

## Bước 2: Hard Refresh trên iPhone

1. Mở Safari trên iPhone 11
2. Vào Settings → Safari → Clear History and Website Data
3. Reload app với hard refresh

## Bước 3: Kiểm tra Console Errors

Kết nối iPhone với Mac:
1. iPhone: Settings → Safari → Advanced → Web Inspector (ON)
2. Mac: Safari → Develop → [Your iPhone] → [Your Page]
3. Xem Console tab có errors gì không

## Bước 4: Test từng tính năng

### Test Viewport
- Zoom in/out có hoạt động không?
- Text có đọc được không?

### Test Hamburger Menu  
- Thử tap và giữ (long press)
- Thử tap nhanh nhiều lần
- Có thấy highlight màu tím khi tap không?

### Test Forms
- Thử submit form bằng keyboard "Go" button
- Thử tap vào input rồi mới tap button

## Bước 5: Nếu vẫn không được

Có thể cần thêm event listeners cho touch events:

```typescript
// Thêm vào button
onTouchStart={(e) => {
  e.stopPropagation();
}}
onTouchEnd={(e) => {
  e.preventDefault();
  // trigger onClick
}}
```

Báo lại kết quả để tôi điều chỉnh tiếp!
