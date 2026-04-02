# Tài liệu Yêu cầu — Nền tảng Truyện Audio

## Giới thiệu

Nền tảng Truyện Audio là một ứng dụng web Next.js App Router + TypeScript cho phép người dùng nghe truyện audio trực tuyến. Hệ thống hỗ trợ xác thực người dùng, phân quyền VIP, trình phát audio với lưu tiến trình, cộng đồng thảo luận, và thanh toán mock. Stack công nghệ: Next.js 16, React 19, TailwindCSS 4, Prisma, PostgreSQL.

## Thuật ngữ

- **Hệ_thống**: Ứng dụng web Truyện Audio tổng thể
- **Auth_Module**: Module xác thực người dùng (đăng ký, đăng nhập, đăng xuất, quên mật khẩu)
- **Middleware_Auth**: Middleware bảo vệ các route yêu cầu đăng nhập
- **Trang_chủ**: Trang landing page chính tại đường dẫn `/`
- **Story_List_Page**: Trang danh sách truyện tại `/stories`
- **Story_Detail_Page**: Trang chi tiết truyện tại `/stories/[slug]`
- **Audio_Player**: Trình phát audio tại `/listen/[episodeId]`
- **VIP_Page**: Trang quản lý gói VIP tại `/vip`
- **Community_Page**: Trang cộng đồng tại `/community`
- **Profile_Page**: Trang hồ sơ cá nhân tại `/profile`
- **User**: Người dùng đã đăng ký với role USER
- **VIP_User**: Người dùng có role VIP và vipExpiredAt > thời điểm hiện tại
- **Admin**: Người dùng có role ADMIN
- **Story**: Một truyện audio gồm tiêu đề, slug, mô tả, ảnh bìa, trạng thái VIP
- **Episode**: Một tập của truyện, gồm audioUrl, thứ tự, thời lượng, trạng thái preview miễn phí
- **Post**: Bài viết trong cộng đồng
- **Comment**: Bình luận trên bài viết cộng đồng
- **Payment**: Bản ghi thanh toán mock với loại gói (WEEK, MONTH, YEAR)
- **ListeningHistory**: Bản ghi lưu tiến trình nghe của người dùng theo tập

## Yêu cầu

### Yêu cầu 1: Đăng ký tài khoản

**User Story:** Là một người dùng mới, tôi muốn đăng ký tài khoản bằng email và mật khẩu, để có thể truy cập các tính năng của nền tảng.

#### Tiêu chí chấp nhận

1. WHEN người dùng gửi form đăng ký với email và mật khẩu hợp lệ, THE Auth_Module SHALL tạo tài khoản mới với role USER và chuyển hướng đến trang đăng nhập.
2. WHEN người dùng gửi form đăng ký với email đã tồn tại, THE Auth_Module SHALL hiển thị thông báo lỗi "Email đã được sử dụng".
3. WHEN người dùng gửi form đăng ký với mật khẩu dưới 6 ký tự, THE Auth_Module SHALL hiển thị thông báo lỗi validation tương ứng.
4. THE Auth_Module SHALL hash mật khẩu trước khi lưu vào cơ sở dữ liệu.

### Yêu cầu 2: Đăng nhập

**User Story:** Là một người dùng đã đăng ký, tôi muốn đăng nhập bằng email và mật khẩu, để truy cập tài khoản của mình.

#### Tiêu chí chấp nhận

1. WHEN người dùng gửi form đăng nhập với email và mật khẩu đúng, THE Auth_Module SHALL tạo session/JWT và chuyển hướng đến trang chủ.
2. WHEN người dùng gửi form đăng nhập với thông tin sai, THE Auth_Module SHALL hiển thị thông báo lỗi "Email hoặc mật khẩu không đúng".
3. THE Auth_Module SHALL lưu trữ token xác thực an toàn trong httpOnly cookie.

### Yêu cầu 3: Đăng xuất

**User Story:** Là một người dùng đã đăng nhập, tôi muốn đăng xuất khỏi tài khoản, để bảo vệ phiên làm việc của mình.

#### Tiêu chí chấp nhận

1. WHEN người dùng nhấn nút đăng xuất, THE Auth_Module SHALL xóa session/token và chuyển hướng về trang chủ.

### Yêu cầu 4: Quên mật khẩu

**User Story:** Là một người dùng quên mật khẩu, tôi muốn yêu cầu đặt lại mật khẩu qua email, để lấy lại quyền truy cập tài khoản.

#### Tiêu chí chấp nhận

1. WHEN người dùng gửi form quên mật khẩu với email đã đăng ký, THE Auth_Module SHALL gửi email mock chứa link đặt lại mật khẩu và hiển thị thông báo xác nhận.
2. WHEN người dùng gửi form quên mật khẩu với email không tồn tại, THE Auth_Module SHALL hiển thị thông báo chung (không tiết lộ email có tồn tại hay không) để bảo vệ thông tin.
3. WHEN người dùng truy cập link đặt lại mật khẩu hợp lệ và gửi mật khẩu mới, THE Auth_Module SHALL cập nhật mật khẩu đã hash và chuyển hướng đến trang đăng nhập.

### Yêu cầu 5: Middleware bảo vệ route

**User Story:** Là quản trị viên hệ thống, tôi muốn bảo vệ các route yêu cầu đăng nhập, để ngăn truy cập trái phép.

#### Tiêu chí chấp nhận

1. WHEN người dùng chưa đăng nhập truy cập route được bảo vệ (/profile, /community/create, /listen/[episodeId]), THE Middleware_Auth SHALL chuyển hướng đến trang đăng nhập với return URL.
2. WHEN người dùng đã đăng nhập truy cập route được bảo vệ, THE Middleware_Auth SHALL cho phép truy cập bình thường.
3. WHEN token xác thực hết hạn hoặc không hợp lệ, THE Middleware_Auth SHALL xóa token và chuyển hướng đến trang đăng nhập.


### Yêu cầu 6: Trang chủ

**User Story:** Là một người truy cập, tôi muốn xem trang chủ với các truyện nổi bật và mới cập nhật, để khám phá nội dung nhanh chóng.

#### Tiêu chí chấp nhận

1. THE Trang_chủ SHALL hiển thị banner giới thiệu nền tảng ở đầu trang.
2. THE Trang_chủ SHALL hiển thị danh sách tối đa 8 truyện nổi bật dưới dạng carousel hoặc grid.
3. THE Trang_chủ SHALL hiển thị danh sách tối đa 8 truyện mới cập nhật sắp xếp theo ngày tạo giảm dần.
4. THE Trang_chủ SHALL hiển thị danh sách tối đa 8 truyện miễn phí (isVip = false).
5. WHILE người dùng chưa có role VIP, THE Trang_chủ SHALL hiển thị CTA (Call-to-Action) nâng cấp VIP.
6. WHEN người dùng nhấn vào thẻ truyện, THE Trang_chủ SHALL chuyển hướng đến Story_Detail_Page tương ứng.

### Yêu cầu 7: Danh sách truyện

**User Story:** Là một người dùng, tôi muốn duyệt và tìm kiếm truyện theo thể loại và trạng thái, để tìm truyện phù hợp.

#### Tiêu chí chấp nhận

1. THE Story_List_Page SHALL hiển thị danh sách truyện dưới dạng grid responsive (2 cột mobile, 3 cột tablet, 4 cột desktop).
2. THE Story_List_Page SHALL hỗ trợ filter theo thể loại truyện.
3. THE Story_List_Page SHALL hỗ trợ filter theo trạng thái: Tất cả, Miễn phí, VIP.
4. WHEN người dùng nhập từ khóa vào ô tìm kiếm, THE Story_List_Page SHALL lọc danh sách truyện theo tên truyện chứa từ khóa (không phân biệt hoa thường).
5. THE Story_List_Page SHALL phân trang với 12 truyện mỗi trang.
6. WHEN người dùng thay đổi filter hoặc tìm kiếm, THE Story_List_Page SHALL đặt lại về trang đầu tiên.

### Yêu cầu 8: Trang chi tiết truyện

**User Story:** Là một người dùng, tôi muốn xem thông tin chi tiết và danh sách tập của một truyện, để quyết định có nghe hay không.

#### Tiêu chí chấp nhận

1. THE Story_Detail_Page SHALL hiển thị ảnh bìa, tên truyện, mô tả, và danh sách tập sắp xếp theo thứ tự (order) tăng dần.
2. WHEN người dùng chưa đăng nhập nhấn nút nghe tập không phải preview, THE Story_Detail_Page SHALL hiển thị modal yêu cầu đăng nhập.
3. WHILE người dùng đã đăng nhập nhưng không có role VIP, THE Story_Detail_Page SHALL hiển thị icon khóa trên các tập có isFreePreview = false.
4. WHEN người dùng không có role VIP nhấn vào tập bị khóa, THE Story_Detail_Page SHALL hiển thị modal yêu cầu nâng cấp VIP với link đến VIP_Page.
5. WHILE người dùng có role VIP, THE Story_Detail_Page SHALL cho phép truy cập tất cả các tập.
6. WHEN người dùng nhấn nút nghe tập được phép truy cập, THE Story_Detail_Page SHALL chuyển hướng đến Audio_Player với episodeId tương ứng.

### Yêu cầu 9: Trình phát Audio

**User Story:** Là một người dùng, tôi muốn nghe truyện audio với các điều khiển phát, để có trải nghiệm nghe tốt.

#### Tiêu chí chấp nhận

1. THE Audio_Player SHALL hiển thị tên truyện, tên tập, và thanh tiến trình phát.
2. THE Audio_Player SHALL cung cấp nút Play/Pause, tua tiến 15 giây, tua lùi 15 giây.
3. THE Audio_Player SHALL cho phép thay đổi tốc độ phát với các mức: 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x.
4. WHEN người dùng đã đăng nhập tạm dừng hoặc rời trang, THE Audio_Player SHALL gọi API lưu tiến trình nghe (progressSeconds) vào ListeningHistory.
5. WHEN người dùng đã đăng nhập quay lại tập đã nghe dở, THE Audio_Player SHALL tự động tua đến vị trí đã lưu trong ListeningHistory.
6. WHEN người dùng không có quyền nghe tập hiện tại, THE Audio_Player SHALL chuyển hướng về Story_Detail_Page và hiển thị thông báo yêu cầu nâng cấp.
7. WHEN người dùng chưa đăng nhập nghe tập preview, THE Audio_Player SHALL giới hạn phát tối đa 5 phút đầu tiên và hiển thị thông báo yêu cầu đăng nhập khi hết thời gian.


### Yêu cầu 10: Trang VIP và thanh toán mock

**User Story:** Là một người dùng, tôi muốn xem các gói VIP và thực hiện thanh toán, để mở khóa toàn bộ nội dung.

#### Tiêu chí chấp nhận

1. THE VIP_Page SHALL hiển thị 3 gói VIP: Tuần, Tháng, Năm với giá và lợi ích tương ứng.
2. WHEN người dùng chưa đăng nhập nhấn nút mua gói, THE VIP_Page SHALL chuyển hướng đến trang đăng nhập.
3. WHEN người dùng đã đăng nhập chọn gói và xác nhận thanh toán mock, THE VIP_Page SHALL tạo bản ghi Payment, cập nhật role thành VIP, và đặt vipExpiredAt theo thời hạn gói.
4. WHILE người dùng đã có role VIP, THE VIP_Page SHALL hiển thị thông tin gói hiện tại và ngày hết hạn thay vì nút mua.
5. IF thanh toán mock thất bại, THEN THE VIP_Page SHALL hiển thị thông báo lỗi và không thay đổi role người dùng.

### Yêu cầu 11: Kiểm tra và hết hạn VIP

**User Story:** Là quản trị viên hệ thống, tôi muốn hệ thống tự động kiểm tra hạn VIP, để đảm bảo quyền truy cập chính xác.

#### Tiêu chí chấp nhận

1. WHEN hệ thống xử lý request từ người dùng có role VIP, THE Middleware_Auth SHALL kiểm tra vipExpiredAt so với thời điểm hiện tại.
2. WHEN vipExpiredAt nhỏ hơn thời điểm hiện tại, THE Middleware_Auth SHALL cập nhật role về USER và xóa vipExpiredAt.
3. THE Hệ_thống SHALL sử dụng vipExpiredAt làm nguồn duy nhất để xác định trạng thái VIP hợp lệ.

### Yêu cầu 12: Trang cộng đồng

**User Story:** Là một người dùng đã đăng nhập, tôi muốn viết bài, bình luận và thích bài viết, để tương tác với cộng đồng.

#### Tiêu chí chấp nhận

1. THE Community_Page SHALL hiển thị danh sách bài viết sắp xếp theo ngày tạo giảm dần.
2. WHEN người dùng đã đăng nhập gửi form tạo bài viết với nội dung hợp lệ, THE Community_Page SHALL tạo Post mới và hiển thị trong danh sách.
3. WHEN người dùng đã đăng nhập gửi bình luận trên bài viết, THE Community_Page SHALL tạo Comment mới và hiển thị dưới bài viết tương ứng.
4. WHEN người dùng đã đăng nhập nhấn nút thích bài viết, THE Community_Page SHALL tăng số lượt thích và đánh dấu trạng thái đã thích.
5. WHEN người dùng nhấn nút thích bài viết đã thích, THE Community_Page SHALL giảm số lượt thích và bỏ đánh dấu trạng thái đã thích.
6. WHEN người dùng là tác giả bài viết hoặc bình luận, THE Community_Page SHALL hiển thị nút xóa cho bài viết hoặc bình luận đó.
7. WHEN người dùng chưa đăng nhập, THE Community_Page SHALL cho phép xem bài viết nhưng ẩn form tạo bài, bình luận, và nút thích.

### Yêu cầu 13: Trang hồ sơ cá nhân

**User Story:** Là một người dùng đã đăng nhập, tôi muốn xem và quản lý thông tin cá nhân, để theo dõi tài khoản của mình.

#### Tiêu chí chấp nhận

1. THE Profile_Page SHALL hiển thị email, role, và ngày tạo tài khoản của người dùng.
2. WHILE người dùng có role VIP, THE Profile_Page SHALL hiển thị trạng thái VIP và ngày hết hạn (vipExpiredAt).
3. THE Profile_Page SHALL hiển thị danh sách truyện đã nghe (dựa trên ListeningHistory) với tiến trình nghe gần nhất.
4. THE Profile_Page SHALL hiển thị lịch sử thanh toán mock gồm loại gói, số tiền, và ngày thanh toán.

### Yêu cầu 14: Cơ sở dữ liệu và Prisma Schema

**User Story:** Là lập trình viên, tôi muốn có schema cơ sở dữ liệu rõ ràng với Prisma, để quản lý dữ liệu hiệu quả.

#### Tiêu chí chấp nhận

1. THE Hệ_thống SHALL định nghĩa Prisma schema với các model: User, Story, Episode, Post, Comment, Payment, ListeningHistory theo đúng cấu trúc đã mô tả trong thuật ngữ.
2. THE Hệ_thống SHALL thiết lập quan hệ: Story có nhiều Episode, User có nhiều Post, Post có nhiều Comment, User có nhiều Payment, User có nhiều ListeningHistory.
3. THE Hệ_thống SHALL cung cấp file seed data mẫu với tối thiểu 5 truyện, mỗi truyện có tối thiểu 3 tập, 2 user mẫu (1 USER, 1 VIP), và 3 bài viết cộng đồng.
4. FOR ALL Episode được tạo, parsing Episode từ database rồi serialize thành JSON rồi parsing lại SHALL tạo ra object tương đương (round-trip property).

### Yêu cầu 15: Cấu trúc dự án và seed data

**User Story:** Là lập trình viên, tôi muốn dự án có cấu trúc thư mục rõ ràng và dữ liệu mẫu, để dễ phát triển và kiểm thử.

#### Tiêu chí chấp nhận

1. THE Hệ_thống SHALL tổ chức mã nguồn theo cấu trúc: /app (routes), /components (UI components), /lib (utilities, API helpers), /prisma (schema, migrations, seed), /types (TypeScript types).
2. THE Hệ_thống SHALL cung cấp script `npm run seed` để chạy seed data vào cơ sở dữ liệu.
3. THE Hệ_thống SHALL cung cấp file README.md với hướng dẫn cài đặt từng bước: clone, install, setup database, migrate, seed, và chạy dev server.


### Yêu cầu 16 (Tùy chọn): Dark Mode

**User Story:** Là một người dùng, tôi muốn chuyển đổi giữa giao diện sáng và tối, để có trải nghiệm xem thoải mái hơn.

#### Tiêu chí chấp nhận

1. WHERE tính năng Dark Mode được bật, THE Hệ_thống SHALL cung cấp nút chuyển đổi giao diện sáng/tối trên header.
2. WHEN người dùng nhấn nút chuyển đổi, THE Hệ_thống SHALL áp dụng theme tương ứng và lưu lựa chọn vào localStorage.
3. WHEN người dùng quay lại trang, THE Hệ_thống SHALL áp dụng theme đã lưu trong localStorage.

### Yêu cầu 17 (Tùy chọn): Admin quản lý truyện

**User Story:** Là Admin, tôi muốn thêm và quản lý truyện cùng các tập, để cập nhật nội dung cho nền tảng.

#### Tiêu chí chấp nhận

1. WHILE người dùng có role ADMIN, THE Hệ_thống SHALL hiển thị menu Admin trong navigation.
2. WHEN Admin gửi form tạo truyện mới với đầy đủ thông tin (tiêu đề, slug, mô tả, ảnh bìa, trạng thái VIP), THE Hệ_thống SHALL tạo Story mới trong cơ sở dữ liệu.
3. WHEN Admin gửi form thêm tập mới cho truyện với đầy đủ thông tin (tiêu đề, audioUrl, thứ tự, thời lượng, trạng thái preview), THE Hệ_thống SHALL tạo Episode mới liên kết với Story tương ứng.
4. WHEN người dùng không có role ADMIN truy cập route admin, THE Middleware_Auth SHALL chuyển hướng về trang chủ.

### Yêu cầu 18 (Tùy chọn): Đánh giá truyện

**User Story:** Là một người dùng đã đăng nhập, tôi muốn đánh giá truyện từ 1 đến 5 sao, để chia sẻ nhận xét với cộng đồng.

#### Tiêu chí chấp nhận

1. WHEN người dùng đã đăng nhập chọn số sao (1-5) trên Story_Detail_Page, THE Hệ_thống SHALL lưu đánh giá và cập nhật điểm trung bình của truyện.
2. WHEN người dùng đã đánh giá truyện trước đó, THE Hệ_thống SHALL hiển thị đánh giá cũ và cho phép cập nhật.
3. THE Story_Detail_Page SHALL hiển thị điểm trung bình và tổng số lượt đánh giá của truyện.
4. WHEN người dùng chưa đăng nhập nhấn vào khu vực đánh giá, THE Hệ_thống SHALL hiển thị modal yêu cầu đăng nhập.
