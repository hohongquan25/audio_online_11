# Kế hoạch Triển khai: Nền tảng Truyện Audio

## Tổng quan

Triển khai nền tảng Truyện Audio theo kiến trúc Next.js 16 App Router + TypeScript + Prisma + PostgreSQL + NextAuth.js v5. Các task được sắp xếp theo thứ tự: cấu trúc dự án → data layer → authentication → middleware → trang công khai → tính năng yêu cầu đăng nhập → tính năng tùy chọn.

## Tasks

- [x] 1. Thiết lập cấu trúc dự án, dependencies và Prisma schema
  - [x] 1.1 Cài đặt dependencies cần thiết
    - Cài đặt: `prisma`, `@prisma/client`, `next-auth@beta`, `bcryptjs`, `zod`, `@types/bcryptjs`
    - Cài đặt dev: `vitest`, `fast-check`, `@testing-library/react`, `@testing-library/jest-dom`, `msw`
    - Tạo file `vitest.config.ts` với cấu hình cho TypeScript paths
    - _Yêu cầu: 14.1, 15.1_

  - [x] 1.2 Tạo Prisma schema và migration
    - Tạo `prisma/schema.prisma` với đầy đủ models: User, Story, Episode, Post, Comment, Like, Payment, ListeningHistory, Rating
    - Định nghĩa enums: Role (USER, VIP, ADMIN), PlanType (WEEK, MONTH, YEAR), PaymentStatus (SUCCESS, FAILED)
    - Thiết lập quan hệ và unique constraints theo design document
    - Tạo file `lib/prisma.ts` cho Prisma client singleton
    - Chạy `npx prisma migrate dev --name init`
    - _Yêu cầu: 14.1, 14.2_

  - [x] 1.3 Tạo seed data
    - Tạo `prisma/seed.ts` với tối thiểu 5 truyện, mỗi truyện 3 tập, 2 user mẫu (1 USER, 1 VIP), 3 bài viết cộng đồng
    - Cấu hình script `npm run seed` trong package.json (prisma.seed)
    - _Yêu cầu: 14.3, 15.2_

  - [x] 1.4 Tạo TypeScript types và Zod validation schemas
    - Tạo `types/index.ts` với SessionUser, ActionResult, ApiError interfaces
    - Tạo `lib/validations.ts` với tất cả Zod schemas: registerSchema, loginSchema, storyFilterSchema, postSchema, commentSchema, ratingSchema, storyCreateSchema, episodeCreateSchema
    - Tạo `lib/utils.ts` với utility functions dùng chung
    - _Yêu cầu: 14.1, 15.1_

  - [ ]* 1.5 Viết property test cho Episode JSON round-trip
    - **Property 29: Episode JSON round-trip**
    - **Validates: Yêu cầu 14.4**

  - [ ]* 1.6 Viết property test cho validation schemas
    - **Property 4: Mật khẩu ngắn bị từ chối**
    - **Validates: Yêu cầu 1.3**

- [x] 2. Checkpoint - Đảm bảo schema, seed, types hoạt động
  - Đảm bảo tất cả tests pass, hỏi người dùng nếu có thắc mắc.

- [x] 3. Triển khai Authentication (NextAuth.js v5)
  - [x] 3.1 Cấu hình Auth.js với Credentials Provider
    - Tạo `lib/auth.ts` với NextAuth config: JWT strategy, Credentials provider
    - Implement callbacks: jwt() gắn userId, role, vipExpiredAt vào token; session() expose ra client
    - Tạo `app/api/auth/[...nextauth]/route.ts` cho Auth.js handlers
    - _Yêu cầu: 2.1, 2.3_

  - [x] 3.2 Implement Server Action đăng ký
    - Tạo `app/actions/auth.ts` với hàm `registerUser`
    - Validate input bằng registerSchema (Zod)
    - Kiểm tra email trùng, hash mật khẩu bằng bcryptjs, tạo user với role USER
    - _Yêu cầu: 1.1, 1.2, 1.3, 1.4_

  - [x] 3.3 Tạo trang đăng ký và đăng nhập
    - Tạo `components/auth/RegisterForm.tsx` (Client Component) với form email, password, name
    - Tạo `components/auth/LoginForm.tsx` (Client Component) với form email, password
    - Tạo `app/(auth)/register/page.tsx` và `app/(auth)/login/page.tsx`
    - Hiển thị lỗi validation inline dưới mỗi field
    - _Yêu cầu: 1.1, 1.2, 1.3, 2.1, 2.2_

  - [x] 3.4 Implement đăng xuất và quên mật khẩu
    - Implement signOut trong Header component
    - Tạo `app/(auth)/forgot-password/page.tsx` với form gửi email reset (mock: log token ra console)
    - Tạo `app/(auth)/reset-password/page.tsx` với form nhập mật khẩu mới
    - Implement Server Actions: `requestPasswordReset`, `resetPassword` trong `app/actions/auth.ts`
    - Response quên mật khẩu phải có cùng format bất kể email có tồn tại hay không
    - _Yêu cầu: 3.1, 4.1, 4.2, 4.3_

  - [ ]* 3.5 Viết property tests cho authentication
    - **Property 1: Đăng ký tạo user với role USER**
    - **Property 2: Mật khẩu được hash trước khi lưu**
    - **Property 3: Email trùng bị từ chối**
    - **Property 5: Đăng nhập đúng trả về session**
    - **Property 6: Đăng nhập sai bị từ chối**
    - **Property 7: Đăng xuất xóa session**
    - **Property 8: Quên mật khẩu không tiết lộ email tồn tại**
    - **Property 9: Đặt lại mật khẩu round-trip**
    - **Validates: Yêu cầu 1.1, 1.2, 1.4, 2.1, 2.2, 3.1, 4.2, 4.3**

- [x] 4. Triển khai Middleware bảo vệ route và kiểm tra VIP
  - [x] 4.1 Tạo middleware.ts
    - Tạo `middleware.ts` tại root dự án
    - Bảo vệ routes: /profile, /community/create, /listen/* → redirect /login?callbackUrl=...
    - Bảo vệ routes admin: /admin/* → chỉ cho role ADMIN, redirect về trang chủ nếu không phải
    - Kiểm tra VIP hết hạn: nếu role=VIP && vipExpiredAt < now → cập nhật role=USER qua API call
    - _Yêu cầu: 5.1, 5.2, 5.3, 11.1, 11.2, 11.3_

  - [ ]* 4.2 Viết property tests cho middleware
    - **Property 10: Middleware bảo vệ route cho user chưa đăng nhập**
    - **Property 11: Middleware cho phép user đã đăng nhập**
    - **Property 12: Token hết hạn bị từ chối**
    - **Property 23: VIP hết hạn bị hạ cấp về USER**
    - **Property 33: Non-admin bị chặn route admin**
    - **Validates: Yêu cầu 5.1, 5.2, 5.3, 11.1, 11.2, 17.4**

- [x] 5. Checkpoint - Đảm bảo auth và middleware hoạt động
  - Đảm bảo tất cả tests pass, hỏi người dùng nếu có thắc mắc.

- [x] 6. Triển khai Layout chung và UI components
  - [x] 6.1 Tạo shared UI components
    - Tạo `components/ui/Button.tsx`, `Modal.tsx`, `Input.tsx`, `Card.tsx`
    - Styling bằng TailwindCSS 4, đảm bảo responsive và accessibility (aria labels, keyboard navigation)
    - _Yêu cầu: 15.1_

  - [x] 6.2 Tạo Header và Footer
    - Tạo `components/layout/Header.tsx` với navigation: Trang chủ, Truyện, Cộng đồng, VIP
    - Hiển thị nút Đăng nhập/Đăng ký khi chưa đăng nhập, avatar + Đăng xuất khi đã đăng nhập
    - Hiển thị menu Admin khi role=ADMIN
    - Tạo `components/layout/Footer.tsx`
    - Tạo `app/(main)/layout.tsx` sử dụng Header + Footer
    - _Yêu cầu: 6.1, 17.1_

- [x] 7. Triển khai Trang chủ
  - [x] 7.1 Implement trang chủ với các section truyện
    - Tạo `app/(main)/page.tsx` (Server Component)
    - Hiển thị banner giới thiệu nền tảng
    - Query và hiển thị 3 sections: truyện nổi bật (8 max), mới cập nhật (8 max, sắp xếp createdAt desc), miễn phí (8 max, isVip=false)
    - Tạo `components/stories/StoryCard.tsx` và `components/stories/StoryGrid.tsx`
    - Hiển thị CTA nâng cấp VIP khi user chưa có role VIP
    - Click vào thẻ truyện → chuyển đến `/stories/[slug]`
    - _Yêu cầu: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [ ]* 7.2 Viết property test cho trang chủ queries
    - **Property 13: Trang chủ giới hạn tối đa 8 items mỗi section**
    - **Validates: Yêu cầu 6.2, 6.3, 6.4**

- [x] 8. Triển khai Danh sách truyện và Chi tiết truyện
  - [x] 8.1 Implement API route danh sách truyện
    - Tạo `app/api/stories/route.ts` (GET) với filter theo genre, status (all/free/vip), search (case-insensitive), pagination (12/trang)
    - Reset về trang 1 khi thay đổi filter/search
    - _Yêu cầu: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [x] 8.2 Tạo trang danh sách truyện
    - Tạo `app/(main)/stories/page.tsx`
    - Tạo `components/stories/StoryFilter.tsx` (Client Component) với filter genre, status, search input
    - Grid responsive: 2 cột mobile, 3 cột tablet, 4 cột desktop
    - Phân trang với navigation
    - _Yêu cầu: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 8.3 Tạo trang chi tiết truyện
    - Tạo `app/(main)/stories/[slug]/page.tsx` (Server Component)
    - Hiển thị ảnh bìa, tên, mô tả, danh sách tập sắp xếp theo order tăng dần
    - Tạo `components/stories/EpisodeList.tsx` (Client Component)
    - Logic hiển thị: icon khóa cho tập VIP khi user không phải VIP, modal yêu cầu đăng nhập/nâng cấp VIP
    - Click nghe tập → chuyển đến `/listen/[episodeId]`
    - _Yêu cầu: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [ ]* 8.4 Viết property tests cho stories
    - **Property 14: Filter truyện theo trạng thái**
    - **Property 15: Tìm kiếm truyện không phân biệt hoa thường**
    - **Property 16: Phân trang tối đa 12 items**
    - **Property 17: Danh sách tập sắp xếp theo order tăng dần**
    - **Property 18: VIP user truy cập mọi tập**
    - **Property 19: Kiểm tra quyền nghe — non-VIP bị chặn tập VIP**
    - **Validates: Yêu cầu 7.3, 7.4, 7.5, 8.1, 8.5, 9.6**

- [x] 9. Triển khai Audio Player
  - [x] 9.1 Implement API route cho episode và listening history
    - Tạo `app/api/episodes/[episodeId]/route.ts` (GET) — trả về thông tin tập + audioUrl, kiểm tra quyền truy cập
    - Tạo `app/api/listening-history/route.ts` (GET/POST) — lấy/lưu tiến trình nghe
    - Tạo Server Actions trong `app/actions/listening.ts`: saveProgress, getProgress
    - _Yêu cầu: 9.4, 9.5, 9.6_

  - [x] 9.2 Tạo AudioPlayer component và trang nghe
    - Tạo `components/audio/AudioPlayer.tsx` (Client Component) sử dụng HTML5 Audio API
    - Implement: Play/Pause, tua tiến/lùi 15 giây, thanh tiến trình, thay đổi tốc độ (0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x)
    - Debounce save progress mỗi 10 giây khi đang phát, save ngay khi pause/beforeunload
    - Tự động tua đến vị trí đã lưu khi quay lại tập đã nghe dở
    - Giới hạn 5 phút cho guest nghe tập preview, hiển thị thông báo yêu cầu đăng nhập
    - Tạo `app/(main)/listen/[episodeId]/page.tsx`
    - _Yêu cầu: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

  - [ ]* 9.3 Viết property test cho listening history
    - **Property 20: Tiến trình nghe round-trip**
    - **Validates: Yêu cầu 9.4, 9.5**

- [x] 10. Checkpoint - Đảm bảo stories, audio player hoạt động
  - Đảm bảo tất cả tests pass, hỏi người dùng nếu có thắc mắc.

- [x] 11. Triển khai VIP và Thanh toán mock
  - [x] 11.1 Implement API route và Server Action thanh toán
    - Tạo `app/api/payments/route.ts` (POST) — xử lý thanh toán mock
    - Tạo `app/actions/payment.ts` với hàm `purchaseVip(plan)`: tạo Payment record, cập nhật role=VIP, đặt vipExpiredAt (WEEK: +7 ngày, MONTH: +30 ngày, YEAR: +365 ngày)
    - Xử lý thanh toán thất bại: không thay đổi role, trả về lỗi
    - _Yêu cầu: 10.3, 10.5_

  - [x] 11.2 Tạo trang VIP
    - Tạo `app/(main)/vip/page.tsx`
    - Hiển thị 3 gói VIP: Tuần, Tháng, Năm với giá và lợi ích
    - Chưa đăng nhập nhấn mua → redirect đăng nhập
    - Đã có VIP → hiển thị thông tin gói hiện tại và ngày hết hạn
    - Xác nhận thanh toán mock → gọi Server Action
    - _Yêu cầu: 10.1, 10.2, 10.3, 10.4_

  - [ ]* 11.3 Viết property tests cho VIP và thanh toán
    - **Property 21: Thanh toán VIP thành công cập nhật role và vipExpiredAt**
    - **Property 22: Thanh toán thất bại không thay đổi role**
    - **Validates: Yêu cầu 10.3, 10.5**

- [x] 12. Triển khai Cộng đồng
  - [x] 12.1 Implement API routes cho cộng đồng
    - Tạo `app/api/posts/route.ts` (GET/POST) — danh sách bài viết (sắp xếp createdAt desc), tạo bài viết
    - Tạo `app/api/posts/[postId]/comments/route.ts` (GET/POST) — bình luận
    - Tạo `app/api/posts/[postId]/like/route.ts` (POST/DELETE) — like/unlike
    - Tạo Server Actions trong `app/actions/community.ts`: createPost, createComment, toggleLike, deletePost, deleteComment
    - _Yêu cầu: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

  - [x] 12.2 Tạo trang cộng đồng và components
    - Tạo `components/community/PostCard.tsx`, `PostForm.tsx`, `CommentSection.tsx`
    - Tạo `app/(main)/community/page.tsx` — danh sách bài viết
    - Tạo `app/(main)/community/create/page.tsx` — form tạo bài viết (protected route)
    - Chưa đăng nhập: xem bài viết nhưng ẩn form tạo bài, bình luận, nút thích
    - Tác giả bài viết/bình luận: hiển thị nút xóa
    - _Yêu cầu: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_

  - [ ]* 12.3 Viết property tests cho cộng đồng
    - **Property 24: Like/Unlike round-trip**
    - **Property 25: Bài viết sắp xếp theo ngày giảm dần**
    - **Property 26: Tạo bài viết với nội dung hợp lệ**
    - **Property 27: Tạo bình luận liên kết đúng bài viết**
    - **Validates: Yêu cầu 12.1, 12.2, 12.3, 12.4, 12.5**

- [x] 13. Triển khai Trang hồ sơ cá nhân
  - [x] 13.1 Tạo trang profile
    - Tạo `app/(main)/profile/page.tsx` (Server Component, protected route)
    - Hiển thị: email, role, ngày tạo tài khoản
    - Hiển thị trạng thái VIP và ngày hết hạn nếu role=VIP
    - Hiển thị danh sách truyện đã nghe (từ ListeningHistory) với tiến trình
    - Hiển thị lịch sử thanh toán mock: loại gói, số tiền, ngày thanh toán
    - _Yêu cầu: 13.1, 13.2, 13.3, 13.4_

  - [ ]* 13.2 Viết property test cho profile data
    - **Property 28: User history trả về đúng dữ liệu**
    - **Validates: Yêu cầu 13.3, 13.4**

- [x] 14. Checkpoint - Đảm bảo VIP, cộng đồng, profile hoạt động
  - Đảm bảo tất cả tests pass, hỏi người dùng nếu có thắc mắc.

- [x] 15. Triển khai tính năng tùy chọn — Dark Mode
  - [x] 15.1 Implement Dark Mode toggle
    - Tạo `components/layout/ThemeToggle.tsx` (Client Component)
    - Nút chuyển đổi sáng/tối trên Header
    - Lưu lựa chọn vào localStorage, áp dụng theme đã lưu khi quay lại trang
    - Sử dụng TailwindCSS dark mode class strategy
    - _Yêu cầu: 16.1, 16.2, 16.3_

  - [ ]* 15.2 Viết property test cho theme
    - **Property 30: Theme preference round-trip**
    - **Validates: Yêu cầu 16.2, 16.3**

- [x] 16. Triển khai tính năng tùy chọn — Admin quản lý truyện
  - [x] 16.1 Tạo trang admin và Server Actions
    - Tạo `app/admin/layout.tsx` với kiểm tra quyền ADMIN
    - Tạo `app/admin/stories/page.tsx` — danh sách truyện (admin view)
    - Tạo `app/admin/stories/create/page.tsx` — form tạo truyện mới
    - Tạo Server Actions trong `app/actions/stories.ts`: createStory, createEpisode
    - Form tạo truyện: title, slug, description, coverImage, isVip
    - Form thêm tập: title, audioUrl, order, duration, isFreePreview
    - _Yêu cầu: 17.1, 17.2, 17.3, 17.4_

  - [ ]* 16.2 Viết property tests cho admin
    - **Property 31: Admin tạo truyện thành công**
    - **Property 32: Admin tạo tập thành công**
    - **Validates: Yêu cầu 17.2, 17.3**

- [x] 17. Triển khai tính năng tùy chọn — Đánh giá truyện
  - [x] 17.1 Implement đánh giá truyện
    - Tạo `app/api/ratings/route.ts` (POST) — tạo/cập nhật đánh giá, tính lại avgRating và ratingCount
    - Thêm component đánh giá sao (1-5) vào Story_Detail_Page
    - Hiển thị đánh giá cũ nếu user đã đánh giá, cho phép cập nhật
    - Hiển thị điểm trung bình và tổng số lượt đánh giá
    - Chưa đăng nhập nhấn đánh giá → modal yêu cầu đăng nhập
    - _Yêu cầu: 18.1, 18.2, 18.3, 18.4_

  - [ ]* 17.2 Viết property test cho đánh giá
    - **Property 34: Đánh giá cập nhật điểm trung bình chính xác**
    - **Validates: Yêu cầu 18.1, 18.2**

- [x] 18. Xử lý lỗi và Error Boundaries
  - [x] 18.1 Tạo error handling và error pages
    - Tạo `app/error.tsx` (global error boundary)
    - Tạo `app/not-found.tsx` (trang 404)
    - Tạo `app/(main)/error.tsx` và `app/(auth)/error.tsx` cho từng route group
    - Implement chuẩn hóa ApiError response format cho tất cả API routes
    - _Yêu cầu: 5.3, 10.5_

- [x] 19. Tạo README.md và hoàn thiện dự án
  - [x] 19.1 Viết README.md hướng dẫn cài đặt
    - Cập nhật `truyen-audio/README.md` với hướng dẫn từng bước: clone, install, setup database (.env), migrate, seed, chạy dev server
    - _Yêu cầu: 15.3_

- [x] 20. Checkpoint cuối — Đảm bảo toàn bộ hệ thống hoạt động
  - Đảm bảo tất cả tests pass, hỏi người dùng nếu có thắc mắc.

## Ghi chú

- Các task có dấu `*` là tùy chọn và có thể bỏ qua để triển khai MVP nhanh hơn
- Mỗi task tham chiếu đến yêu cầu cụ thể để đảm bảo truy vết
- Checkpoints đảm bảo kiểm tra tăng dần sau mỗi nhóm tính năng
- Property tests kiểm tra tính đúng đắn phổ quát, unit tests kiểm tra ví dụ cụ thể và edge cases
- Yêu cầu 16, 17, 18 là tùy chọn — triển khai sau các tính năng core
