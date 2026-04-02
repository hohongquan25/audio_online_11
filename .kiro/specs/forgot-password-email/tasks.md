# Implementation Plan: Forgot Password Email

## Overview

Triển khai tính năng gửi email quên mật khẩu với SMTP email service thực sự, thay thế console.log hiện tại. Implementation bao gồm: tích hợp nodemailer, tạo HTML email template responsive, cập nhật server actions với email validation và error handling, và viết property-based tests cho các correctness properties.

## Tasks

- [x] 1. Cài đặt dependencies và cấu hình môi trường
  - Cài đặt nodemailer và @types/nodemailer
  - Thêm SMTP configuration vào .env file
  - Verify environment variables được load đúng
  - _Requirements: 2.2_

- [x] 2. Tạo Email Service module
  - [x] 2.1 Implement EmailService class với nodemailer
    - Tạo file `truyen-audio/lib/email.ts`
    - Implement constructor với SMTP config từ env variables
    - Implement `sendPasswordResetEmail()` method
    - Implement error handling cho SMTP errors
    - _Requirements: 2.1, 2.2, 2.6, 6.1, 6.2_
  
  - [x] 2.2 Tạo HTML email template
    - Implement `createPasswordResetTemplate()` method
    - Tạo responsive HTML template với inline CSS
    - Include reset button và fallback link
    - Include expiry time và security notice
    - _Requirements: 2.4, 2.5, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_
  
  - [x] 2.3 Implement factory function `createEmailService()`
    - Đọc config từ environment variables
    - Validate required env variables
    - Return configured EmailService instance
    - _Requirements: 2.2_

- [ ]* 2.4 Write unit tests cho Email Service
  - Test SMTP connection với mock transporter
  - Test email template generation
  - Test error handling cho SMTP failures
  - Test environment variable validation
  - _Requirements: 2.1, 2.2, 2.4, 2.5, 2.6_

- [x] 3. Cập nhật Server Actions
  - [x] 3.1 Update `requestPasswordReset()` với email validation
    - Thêm email format validation với zod
    - Implement security response (không tiết lộ email existence)
    - Integrate EmailService để gửi email thực
    - Thêm try-catch cho email sending errors
    - Thêm logging cho errors và success cases
    - _Requirements: 1.1, 1.5, 2.1, 2.6, 2.7, 5.5, 6.1, 6.2, 6.3_
  
  - [x] 3.2 Verify `resetPassword()` implementation
    - Kiểm tra password validation (min 6 chars)
    - Kiểm tra token validation logic
    - Kiểm tra token expiry handling
    - Kiểm tra token deletion after use
    - Kiểm tra orphaned token handling
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.6_

- [ ]* 3.3 Write property test for email validation
  - **Property 1: Email Format Validation**
  - **Validates: Requirements 1.1**
  - Test với arbitrary strings từ fast-check
  - Verify chỉ valid emails được process
  - _Requirements: 1.1_

- [ ]* 3.4 Write property test for token uniqueness
  - **Property 2: Token Uniqueness**
  - **Validates: Requirements 1.2**
  - Generate multiple tokens và verify uniqueness
  - _Requirements: 1.2, 5.1_

- [ ]* 3.5 Write property test for token expiry time
  - **Property 3: Token Expiry Time**
  - **Validates: Requirements 1.3, 5.4**
  - Verify expiry time là exactly 1 hour ± 5 seconds
  - _Requirements: 1.3, 5.4_

- [ ]* 3.6 Write property test for old token cleanup
  - **Property 4: Old Token Cleanup**
  - **Validates: Requirements 1.4, 5.3**
  - Create multiple tokens cho same email
  - Verify chỉ newest token tồn tại
  - _Requirements: 1.4, 5.3_

- [ ]* 3.7 Write property test for response consistency
  - **Property 5: Response Consistency for Security**
  - **Validates: Requirements 1.5, 5.5**
  - Test với existing và non-existing emails
  - Verify response message giống nhau
  - _Requirements: 1.5, 5.5_

- [x] 4. Checkpoint - Test email service integration
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 5. Write property tests cho email service
  - [ ]* 5.1 Property test for email service invocation
    - **Property 6: Email Service Invocation**
    - **Validates: Requirements 2.1**
    - Verify email service được gọi exactly once
    - _Requirements: 2.1_
  
  - [ ]* 5.2 Property test for reset URL format
    - **Property 7: Reset URL Format**
    - **Validates: Requirements 2.3**
    - Verify URL format với any token
    - Verify token trong URL là valid UUID
    - _Requirements: 2.3, 5.1_
  
  - [ ]* 5.3 Property test for email content completeness
    - **Property 8: Email Content Completeness**
    - **Validates: Requirements 2.4, 7.4**
    - Verify email chứa reset URL và expiry info
    - _Requirements: 2.4, 7.4_

- [ ]* 6. Write property tests cho token validation
  - [ ]* 6.1 Property test for token lookup validation
    - **Property 11: Token Lookup Validation**
    - **Validates: Requirements 3.1**
    - Test với arbitrary token strings
    - _Requirements: 3.1_
  
  - [ ]* 6.2 Property test for non-existent token error
    - **Property 12: Non-existent Token Error**
    - **Validates: Requirements 3.2**
    - Verify error message consistency
    - _Requirements: 3.2_
  
  - [ ]* 6.3 Property test for token expiry validation
    - **Property 13: Token Expiry Validation**
    - **Validates: Requirements 3.3**
    - Test với expired và valid tokens
    - _Requirements: 3.3_
  
  - [ ]* 6.4 Property test for expired token cleanup
    - **Property 14: Expired Token Cleanup**
    - **Validates: Requirements 3.4**
    - Verify expired tokens được delete
    - _Requirements: 3.4_

- [ ]* 7. Write property tests cho password reset
  - [ ]* 7.1 Property test for password length validation
    - **Property 16: Password Length Validation**
    - **Validates: Requirements 4.1**
    - Test với arbitrary strings < 6 chars
    - _Requirements: 4.1_
  
  - [ ]* 7.2 Property test for password hashing round trip
    - **Property 17: Password Hashing Round Trip**
    - **Validates: Requirements 4.2**
    - Test bcrypt hash và verify
    - _Requirements: 4.2_
  
  - [ ]* 7.3 Property test for token one-time use
    - **Property 19: Token One-Time Use**
    - **Validates: Requirements 4.4, 5.6**
    - Verify token deleted after successful use
    - _Requirements: 4.4, 5.6_
  
  - [ ]* 7.4 Property test for orphaned token handling
    - **Property 21: Orphaned Token Handling**
    - **Validates: Requirements 4.6**
    - Test token với non-existent user
    - _Requirements: 4.6_
  
  - [ ]* 7.5 Property test for token UUID format
    - **Property 22: Token UUID Format**
    - **Validates: Requirements 5.1**
    - Verify generated tokens match UUID v4 pattern
    - _Requirements: 5.1_

- [ ]* 8. Write integration tests
  - Test full forgot password flow (request → email → reset)
  - Test concurrent token requests cho same email
  - Test email service với mock SMTP server
  - _Requirements: All_

- [x] 9. Final checkpoint - Verify implementation
  - Ensure all tests pass, ask the user if questions arise.
  - Test manually với real SMTP server (Gmail)
  - Verify email template hiển thị tốt trên mobile và desktop

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Email service sử dụng nodemailer với Gmail SMTP
- Token được lưu plain text vì đã đủ random và có expiry ngắn
- Property tests sử dụng fast-check library (đã có trong package.json)
- Implementation hiện tại đã có token logic, chỉ cần thêm email service
- Logging strategy: ERROR cho failures, INFO cho success, DEBUG cho development
