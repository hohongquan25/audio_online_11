# Requirements Document

## Introduction

Tài liệu này mô tả các yêu cầu nghiệp vụ cho tính năng gửi email quên mật khẩu trên nền tảng truyện audio. Tính năng này cho phép người dùng yêu cầu đặt lại mật khẩu thông qua email khi họ quên mật khẩu đăng nhập. Hệ thống sẽ tạo token bảo mật, gửi email chứa link reset password, và cho phép người dùng đặt lại mật khẩu mới một cách an toàn.

## Glossary

- **User**: Người dùng đã đăng ký tài khoản trên nền tảng truyện audio
- **Password_Reset_System**: Hệ thống xử lý quy trình đặt lại mật khẩu
- **Email_Service**: Dịch vụ gửi email thông qua SMTP
- **Reset_Token**: Mã token duy nhất và có thời hạn được tạo để xác thực yêu cầu đặt lại mật khẩu
- **Reset_Link**: Đường dẫn URL chứa Reset_Token để người dùng truy cập trang đặt lại mật khẩu
- **Token_Expiry**: Thời gian hết hạn của Reset_Token (mặc định 1 giờ)
- **Database**: Cơ sở dữ liệu PostgreSQL lưu trữ thông tin người dùng và token

## Requirements

### Requirement 1: Yêu cầu đặt lại mật khẩu

**User Story:** Là một người dùng quên mật khẩu, tôi muốn yêu cầu đặt lại mật khẩu qua email, để tôi có thể lấy lại quyền truy cập vào tài khoản của mình.

#### Acceptance Criteria

1. WHEN User gửi form quên mật khẩu với email hợp lệ, THE Password_Reset_System SHALL xác thực định dạng email
2. WHEN email tồn tại trong Database, THE Password_Reset_System SHALL tạo Reset_Token duy nhất
3. WHEN Reset_Token được tạo, THE Password_Reset_System SHALL lưu Reset_Token vào Database với thời gian hết hạn là 1 giờ
4. WHEN Reset_Token được lưu thành công, THE Password_Reset_System SHALL xóa tất cả Reset_Token cũ của email đó trước khi tạo token mới
5. WHEN User gửi yêu cầu với email không tồn tại, THE Password_Reset_System SHALL trả về thông báo thành công giống như email tồn tại để bảo vệ thông tin người dùng

### Requirement 2: Gửi email đặt lại mật khẩu

**User Story:** Là một người dùng đã yêu cầu đặt lại mật khẩu, tôi muốn nhận email chứa link đặt lại mật khẩu, để tôi có thể truy cập trang đặt lại mật khẩu một cách an toàn.

#### Acceptance Criteria

1. WHEN Reset_Token được tạo thành công, THE Email_Service SHALL gửi email đến địa chỉ email của User
2. THE Email_Service SHALL sử dụng SMTP với thông tin cấu hình từ biến môi trường (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM)
3. THE Email_Service SHALL tạo Reset_Link với định dạng "{NEXTAUTH_URL}/reset-password?token={Reset_Token}"
4. THE Email_Service SHALL gửi email với nội dung tiếng Việt bao gồm Reset_Link và thông tin Token_Expiry
5. THE Email_Service SHALL định dạng email dưới dạng HTML với giao diện thân thiện và dễ đọc
6. IF Email_Service gặp lỗi khi gửi email, THEN THE Password_Reset_System SHALL ghi log lỗi chi tiết và trả về thông báo lỗi cho User
7. WHEN email được gửi thành công, THE Password_Reset_System SHALL trả về thông báo thành công cho User

### Requirement 3: Xác thực token đặt lại mật khẩu

**User Story:** Là một người dùng nhấp vào link đặt lại mật khẩu, tôi muốn hệ thống xác thực token của tôi, để đảm bảo yêu cầu đặt lại mật khẩu là hợp lệ và an toàn.

#### Acceptance Criteria

1. WHEN User truy cập Reset_Link, THE Password_Reset_System SHALL kiểm tra sự tồn tại của Reset_Token trong Database
2. IF Reset_Token không tồn tại trong Database, THEN THE Password_Reset_System SHALL hiển thị thông báo lỗi "Token không hợp lệ hoặc đã hết hạn"
3. WHEN Reset_Token tồn tại, THE Password_Reset_System SHALL kiểm tra thời gian hết hạn của token
4. IF Reset_Token đã hết hạn, THEN THE Password_Reset_System SHALL xóa token khỏi Database và hiển thị thông báo lỗi "Token không hợp lệ hoặc đã hết hạn"
5. WHEN Reset_Token hợp lệ và chưa hết hạn, THE Password_Reset_System SHALL hiển thị form đặt lại mật khẩu

### Requirement 4: Đặt lại mật khẩu mới

**User Story:** Là một người dùng có token hợp lệ, tôi muốn đặt mật khẩu mới cho tài khoản của mình, để tôi có thể đăng nhập lại với mật khẩu mới.

#### Acceptance Criteria

1. WHEN User gửi form đặt lại mật khẩu, THE Password_Reset_System SHALL xác thực mật khẩu mới có độ dài tối thiểu 6 ký tự
2. WHEN mật khẩu mới hợp lệ, THE Password_Reset_System SHALL mã hóa mật khẩu bằng bcrypt với salt rounds là 10
3. WHEN mật khẩu được mã hóa, THE Password_Reset_System SHALL cập nhật mật khẩu mới vào Database cho User tương ứng với email của Reset_Token
4. WHEN mật khẩu được cập nhật thành công, THE Password_Reset_System SHALL xóa Reset_Token khỏi Database
5. WHEN Reset_Token được xóa, THE Password_Reset_System SHALL chuyển hướng User đến trang đăng nhập với thông báo thành công
6. IF User không tồn tại trong Database, THEN THE Password_Reset_System SHALL xóa Reset_Token và trả về thông báo lỗi "Token không hợp lệ hoặc đã hết hạn"

### Requirement 5: Bảo mật và giới hạn

**User Story:** Là quản trị viên hệ thống, tôi muốn hệ thống có các biện pháp bảo mật, để ngăn chặn lạm dụng tính năng đặt lại mật khẩu.

#### Acceptance Criteria

1. THE Password_Reset_System SHALL tạo Reset_Token bằng crypto.randomUUID() để đảm bảo tính ngẫu nhiên và duy nhất
2. THE Password_Reset_System SHALL lưu trữ Reset_Token dưới dạng plain text trong Database vì token đã đủ ngẫu nhiên và có thời hạn ngắn
3. WHEN User yêu cầu đặt lại mật khẩu nhiều lần, THE Password_Reset_System SHALL chỉ giữ lại Reset_Token mới nhất và xóa các token cũ
4. THE Password_Reset_System SHALL đặt Token_Expiry là 1 giờ kể từ thời điểm tạo token
5. THE Password_Reset_System SHALL không tiết lộ thông tin về sự tồn tại của email trong hệ thống thông qua thông báo phản hồi
6. WHEN Reset_Token được sử dụng thành công, THE Password_Reset_System SHALL xóa token ngay lập tức để ngăn chặn tái sử dụng

### Requirement 6: Xử lý lỗi và logging

**User Story:** Là nhà phát triển, tôi muốn hệ thống ghi log chi tiết các lỗi, để tôi có thể debug và khắc phục sự cố nhanh chóng.

#### Acceptance Criteria

1. WHEN Email_Service gặp lỗi kết nối SMTP, THE Password_Reset_System SHALL ghi log lỗi với thông tin chi tiết về SMTP_HOST và SMTP_PORT
2. WHEN Email_Service gặp lỗi xác thực, THE Password_Reset_System SHALL ghi log lỗi với thông tin về SMTP_USER
3. WHEN Database gặp lỗi khi lưu hoặc truy vấn Reset_Token, THE Password_Reset_System SHALL ghi log lỗi và trả về thông báo lỗi chung cho User
4. WHERE môi trường development, THE Password_Reset_System SHALL ghi log Reset_Link ra console để developer có thể test
5. THE Password_Reset_System SHALL không ghi log mật khẩu người dùng hoặc thông tin nhạy cảm khác

### Requirement 7: Template email

**User Story:** Là một người dùng nhận email đặt lại mật khẩu, tôi muốn email có giao diện chuyên nghiệp và dễ hiểu, để tôi có thể dễ dàng thực hiện các bước đặt lại mật khẩu.

#### Acceptance Criteria

1. THE Email_Service SHALL tạo email template HTML với tiêu đề "Đặt lại mật khẩu - TruyệnAudio"
2. THE Email_Service SHALL bao gồm lời chào và hướng dẫn rõ ràng bằng tiếng Việt
3. THE Email_Service SHALL hiển thị Reset_Link dưới dạng button hoặc link dễ nhấp
4. THE Email_Service SHALL hiển thị thông tin Token_Expiry (1 giờ) trong email
5. THE Email_Service SHALL bao gồm thông báo bảo mật: "Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này"
6. THE Email_Service SHALL sử dụng màu sắc và font chữ phù hợp với thương hiệu TruyệnAudio
7. THE Email_Service SHALL đảm bảo email hiển thị tốt trên cả desktop và mobile

