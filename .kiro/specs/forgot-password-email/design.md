# Design Document: Forgot Password Email

## Overview

Tính năng gửi email quên mật khẩu cho phép người dùng khôi phục quyền truy cập tài khoản thông qua email xác thực. Hệ thống tạo token bảo mật có thời hạn, gửi email chứa link reset password qua SMTP, và cho phép người dùng đặt lại mật khẩu mới một cách an toàn.

Thiết kế này tập trung vào việc bổ sung email service thực sự vào implementation hiện có, đảm bảo bảo mật, và cung cấp trải nghiệm người dùng tốt với email template chuyên nghiệp.

**Key Design Goals:**
- Tích hợp SMTP email service với nodemailer
- Tạo HTML email template responsive và professional
- Đảm bảo bảo mật với token expiry và one-time use
- Xử lý lỗi gracefully và logging chi tiết
- Testable với property-based testing

## Architecture

### System Components

```
┌─────────────────┐
│  User Browser   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│              Next.js App Router                         │
│                                                         │
│  ┌──────────────────┐      ┌──────────────────┐       │
│  │ ForgotPassword   │      │ ResetPassword    │       │
│  │ Form (Client)    │      │ Form (Client)    │       │
│  └────────┬─────────┘      └────────┬─────────┘       │
│           │                          │                  │
│           ▼                          ▼                  │
│  ┌──────────────────────────────────────────────┐     │
│  │     Server Actions (auth.ts)                 │     │
│  │  - requestPasswordReset()                    │     │
│  │  - resetPassword()                           │     │
│  └────────┬─────────────────────────────┬───────┘     │
│           │                              │              │
└───────────┼──────────────────────────────┼──────────────┘
            │                              │
            ▼                              ▼
   ┌────────────────┐           ┌──────────────────┐
   │ Email Service  │           │ Prisma ORM       │
   │ (lib/email.ts) │           │                  │
   └────────┬───────┘           └────────┬─────────┘
            │                            │
            ▼                            ▼
   ┌────────────────┐           ┌──────────────────┐
   │ SMTP Server    │           │ PostgreSQL DB    │
   │ (Gmail)        │           │ - User           │
   └────────────────┘           │ - PasswordReset  │
                                │   Token          │
                                └──────────────────┘
```

### Data Flow

**Forgot Password Flow:**
1. User nhập email vào ForgotPasswordForm
2. Client gọi server action `requestPasswordReset()`
3. Server action:
   - Validate email format
   - Check user existence trong database
   - Xóa old tokens cho email đó
   - Tạo new token với crypto.randomUUID()
   - Lưu token vào database với expiry 1 giờ
   - Gọi Email Service để gửi email
4. Email Service:
   - Tạo HTML email từ template
   - Kết nối SMTP server
   - Gửi email với reset link
5. Return success message (không tiết lộ email existence)

**Reset Password Flow:**
1. User click link trong email
2. Browser navigate đến /reset-password?token={token}
3. ResetPasswordForm validate token:
   - Check token existence
   - Check token expiry
4. User nhập password mới
5. Client gọi server action `resetPassword()`
6. Server action:
   - Validate token again
   - Hash password mới với bcrypt
   - Update user password
   - Delete token
   - Redirect to login

## Components and Interfaces

### 1. Email Service Module

**File:** `truyen-audio/lib/email.ts`

```typescript
import nodemailer from 'nodemailer';

export interface SendPasswordResetEmailParams {
  to: string;
  resetUrl: string;
  expiryHours: number;
}

export interface EmailServiceConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;
  private config: EmailServiceConfig;

  constructor(config: EmailServiceConfig);
  
  async sendPasswordResetEmail(params: SendPasswordResetEmailParams): Promise<void>;
  
  private createPasswordResetTemplate(resetUrl: string, expiryHours: number): string;
}

export function createEmailService(): EmailService;
```

**Responsibilities:**
- Khởi tạo SMTP transporter với nodemailer
- Tạo HTML email template
- Gửi email với error handling
- Logging cho debugging

### 2. Email Template

**HTML Structure:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Đặt lại mật khẩu</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center;">
              <h1 style="margin: 0; color: #7c3aed; font-size: 24px;">TruyệnAudio</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 20px 40px;">
              <h2 style="margin: 0 0 20px; color: #333; font-size: 20px;">Đặt lại mật khẩu</h2>
              <p style="margin: 0 0 20px; color: #666; line-height: 1.6;">
                Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. 
                Nhấp vào nút bên dưới để tạo mật khẩu mới:
              </p>
              <!-- Button -->
              <table role="presentation" style="margin: 30px 0;">
                <tr>
                  <td style="border-radius: 6px; background-color: #7c3aed;">
                    <a href="{{RESET_URL}}" style="display: inline-block; padding: 14px 40px; color: #ffffff; text-decoration: none; font-weight: bold;">
                      Đặt lại mật khẩu
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 20px 0; color: #666; line-height: 1.6; font-size: 14px;">
                Hoặc copy link sau vào trình duyệt:<br>
                <a href="{{RESET_URL}}" style="color: #7c3aed; word-break: break-all;">{{RESET_URL}}</a>
              </p>
              <p style="margin: 20px 0; color: #999; font-size: 14px;">
                Link này sẽ hết hạn sau {{EXPIRY_HOURS}} giờ.
              </p>
            </td>
          </tr>
          <!-- Security Notice -->
          <tr>
            <td style="padding: 20px 40px; background-color: #fff3cd; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                <strong>⚠️ Lưu ý bảo mật:</strong><br>
                Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này. 
                Mật khẩu của bạn sẽ không thay đổi.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

**Template Variables:**
- `{{RESET_URL}}`: Full URL với token
- `{{EXPIRY_HOURS}}`: Số giờ hết hạn (1)

### 3. Server Actions Updates

**File:** `truyen-audio/app/actions/auth.ts`

**Updated `requestPasswordReset()`:**
```typescript
export async function requestPasswordReset(data: {
  email: string;
}): Promise<ActionResult> {
  try {
    const { email } = data;

    // Validate email format
    const emailSchema = z.string().email();
    if (!emailSchema.safeParse(email).success) {
      return {
        success: true, // Don't reveal validation errors
        message: "Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu.",
      };
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      // Delete old tokens
      await prisma.passwordResetToken.deleteMany({ where: { email } });

      // Create new token
      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.passwordResetToken.create({
        data: { email, token, expiresAt }
      });

      // Send email
      const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
      const emailService = createEmailService();
      
      try {
        await emailService.sendPasswordResetEmail({
          to: email,
          resetUrl,
          expiryHours: 1,
        });
      } catch (emailError) {
        console.error('[Email Error]', emailError);
        return {
          success: false,
          message: "Không thể gửi email. Vui lòng thử lại sau.",
        };
      }
    }

    return {
      success: true,
      message: "Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu.",
    };
  } catch (error) {
    console.error('[Password Reset Request Error]', error);
    return {
      success: false,
      message: "Đã xảy ra lỗi. Vui lòng thử lại sau.",
    };
  }
}
```

### 4. Environment Variables

**Required in `.env`:**
```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=TruyệnAudio <your-email@gmail.com>

# App URL
NEXTAUTH_URL=http://localhost:3000
```

## Data Models

### PasswordResetToken (Existing)

```prisma
model PasswordResetToken {
  id        String   @id @default(cuid())
  email     String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
}
```

**Fields:**
- `id`: Primary key (CUID)
- `email`: Email của user yêu cầu reset (không phải foreign key để tránh cascade issues)
- `token`: UUID token duy nhất
- `expiresAt`: Thời điểm hết hạn (1 giờ sau khi tạo)
- `createdAt`: Timestamp tạo token

**Indexes:**
- `@unique` trên `token` để đảm bảo uniqueness và fast lookup

**Data Lifecycle:**
- Token được tạo khi user request password reset
- Token được xóa khi:
  - User successfully reset password
  - Token expired và user cố gắng sử dụng
  - User request new token (xóa old tokens)

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Email Format Validation

*For any* input string submitted to the forgot password form, the system should validate it against standard email format rules and only process valid email formats.

**Validates: Requirements 1.1**

### Property 2: Token Uniqueness

*For any* password reset request for an existing user, the system should generate a token that is unique across all existing tokens in the database.

**Validates: Requirements 1.2**

### Property 3: Token Expiry Time

*For any* newly created password reset token, the expiry time should be exactly 1 hour (3600 seconds ± 5 seconds tolerance) from the creation time.

**Validates: Requirements 1.3, 5.4**

### Property 4: Old Token Cleanup

*For any* email address, when a new password reset token is created, all previous tokens for that email should be deleted from the database, ensuring only the newest token exists.

**Validates: Requirements 1.4, 5.3**

### Property 5: Response Consistency for Security

*For any* email address (whether existing or non-existing in the system), the password reset request should return the same success message to prevent email enumeration attacks.

**Validates: Requirements 1.5, 5.5**

### Property 6: Email Service Invocation

*For any* valid password reset request for an existing user, the email service should be called exactly once with the correct recipient email and reset URL.

**Validates: Requirements 2.1**

### Property 7: Reset URL Format

*For any* generated reset token, the reset URL should follow the format "{NEXTAUTH_URL}/reset-password?token={token}" where token is a valid UUID.

**Validates: Requirements 2.3**

### Property 8: Email Content Completeness

*For any* password reset email sent, the email HTML content should contain both the reset URL and the expiry duration information (1 hour).

**Validates: Requirements 2.4, 7.4**

### Property 9: Email Error Handling

*For any* SMTP error during email sending, the system should log the error details and return an error message to the user indicating email sending failure.

**Validates: Requirements 2.6**

### Property 10: Success Response After Email

*For any* successful email sending operation, the system should return a success response to the user.

**Validates: Requirements 2.7**

### Property 11: Token Lookup Validation

*For any* token string provided in a reset password request, the system should query the database to verify the token's existence before proceeding.

**Validates: Requirements 3.1**

### Property 12: Non-existent Token Error

*For any* token that does not exist in the database, the system should return the error message "Token không hợp lệ hoặc đã hết hạn".

**Validates: Requirements 3.2**

### Property 13: Token Expiry Validation

*For any* existing token in the database, the system should compare the token's expiry time with the current time to determine validity.

**Validates: Requirements 3.3**

### Property 14: Expired Token Cleanup

*For any* expired token, when accessed, the system should delete the token from the database and return the error message "Token không hợp lệ hoặc đã hết hạn".

**Validates: Requirements 3.4**

### Property 15: Valid Token Allows Reset

*For any* valid and non-expired token, the system should allow the password reset operation to proceed without errors.

**Validates: Requirements 3.5**

### Property 16: Password Length Validation

*For any* password submitted in the reset password form, the system should reject passwords shorter than 6 characters with an appropriate error message.

**Validates: Requirements 4.1**

### Property 17: Password Hashing Round Trip

*For any* valid password string, after hashing with bcrypt (salt rounds 10), the original password should be verifiable using bcrypt.compare() against the hash.

**Validates: Requirements 4.2**

### Property 18: Password Update Persistence

*For any* successful password reset operation, the user's password in the database should be updated to the new hashed password, and subsequent login attempts with the new password should succeed.

**Validates: Requirements 4.3**

### Property 19: Token One-Time Use

*For any* token used successfully in a password reset operation, the token should be immediately deleted from the database, preventing reuse of the same token.

**Validates: Requirements 4.4, 5.6**

### Property 20: Success Response After Reset

*For any* successful password reset operation, the system should return a success response indicating the password has been reset.

**Validates: Requirements 4.5**

### Property 21: Orphaned Token Handling

*For any* token associated with an email that no longer has a corresponding user in the database, the system should delete the token and return the error message "Token không hợp lệ hoặc đã hết hạn".

**Validates: Requirements 4.6**

### Property 22: Token UUID Format

*For any* generated password reset token, the token should be a valid UUID v4 format (matching the pattern: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx where x is any hexadecimal digit and y is one of 8, 9, A, or B).

**Validates: Requirements 5.1**

### Property 23: SMTP Error Logging

*For any* SMTP connection or sending error, the system should log error details including SMTP host and port information for debugging purposes.

**Validates: Requirements 6.1, 6.2**

### Property 24: Database Error Handling

*For any* database error during token operations, the system should log the error and return a generic error message to the user without exposing internal details.

**Validates: Requirements 6.3**

### Property 25: Password Logging Prevention

*For any* logging operation in the password reset flow, the log output should never contain user passwords (either plain text or hashed).

**Validates: Requirements 6.5**

### Property 26: Email Contains Clickable Link

*For any* password reset email HTML, the content should contain at least one anchor tag (<a>) with href attribute pointing to the reset URL.

**Validates: Requirements 7.3**

## Error Handling

### Error Categories

**1. Validation Errors**
- Invalid email format
- Password too short (< 6 characters)
- Missing required fields

**Response Strategy:**
- For email validation: Return generic success message (security)
- For password validation: Return specific error message
- HTTP Status: 200 OK (to prevent information leakage)

**2. Token Errors**
- Token not found
- Token expired
- Token already used

**Response Strategy:**
- Unified error message: "Token không hợp lệ hoặc đã hết hạn"
- Delete invalid/expired tokens from database
- HTTP Status: 200 OK with error in response body

**3. Email Service Errors**
- SMTP connection failure
- Authentication failure
- Network timeout

**Response Strategy:**
- Log detailed error with SMTP config info (host, port, user)
- Return user-friendly message: "Không thể gửi email. Vui lòng thử lại sau."
- HTTP Status: 500 Internal Server Error
- Consider retry mechanism (future enhancement)

**4. Database Errors**
- Connection failure
- Query timeout
- Constraint violations

**Response Strategy:**
- Log full error stack trace
- Return generic message: "Đã xảy ra lỗi. Vui lòng thử lại sau."
- HTTP Status: 500 Internal Server Error
- Ensure no sensitive data in user-facing messages

### Error Logging Strategy

**Log Levels:**
- `ERROR`: SMTP failures, database errors, unexpected exceptions
- `WARN`: Expired token access attempts, invalid token attempts
- `INFO`: Successful password resets, email sent confirmations
- `DEBUG`: Token generation, email template rendering (dev only)

**Log Format:**
```typescript
console.error('[Password Reset Error]', {
  type: 'SMTP_ERROR' | 'DB_ERROR' | 'VALIDATION_ERROR',
  message: string,
  context: {
    email?: string, // Only log email, never password
    tokenId?: string,
    timestamp: Date,
  },
  error: Error,
});
```

**Security Considerations:**
- Never log passwords (plain or hashed)
- Never log full tokens in production
- Sanitize email addresses in logs if needed
- Use structured logging for easier parsing

### Graceful Degradation

**Email Service Unavailable:**
- Return error to user immediately
- Don't create token if email can't be sent
- Suggest user try again later

**Database Unavailable:**
- Return error to user
- Don't attempt email sending
- Log for monitoring/alerting

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests for comprehensive coverage:

**Unit Tests** focus on:
- Specific examples of valid/invalid emails
- Edge cases (empty strings, special characters)
- Error conditions (SMTP failures, DB errors)
- Integration points (email service, database)
- Specific email template content

**Property-Based Tests** focus on:
- Universal properties across all inputs
- Token generation and validation logic
- Password hashing and verification
- URL formatting consistency
- Response message consistency

### Property-Based Testing Configuration

**Library:** fast-check (already in package.json)

**Configuration:**
- Minimum 100 iterations per property test
- Each test references its design document property
- Tag format: `Feature: forgot-password-email, Property {number}: {property_text}`

**Example Property Test Structure:**
```typescript
import fc from 'fast-check';
import { describe, it, expect } from 'vitest';

describe('Feature: forgot-password-email', () => {
  it('Property 3: Token Expiry Time', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.emailAddress(),
        async (email) => {
          const beforeTime = Date.now();
          const token = await createPasswordResetToken(email);
          const afterTime = Date.now();
          
          const expectedExpiry = beforeTime + 3600000; // 1 hour
          const tolerance = 5000; // 5 seconds
          
          expect(token.expiresAt.getTime()).toBeGreaterThanOrEqual(expectedExpiry - tolerance);
          expect(token.expiresAt.getTime()).toBeLessThanOrEqual(afterTime + 3600000 + tolerance);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Test Coverage Requirements

**Unit Tests:**
1. Email validation with specific examples
2. Token generation produces valid UUIDs
3. Email template contains required elements
4. SMTP error handling with mocked failures
5. Database error handling with mocked failures
6. Token expiry edge cases (exactly at expiry time)
7. Password hashing with bcrypt verification
8. Token cleanup after successful reset

**Property-Based Tests:**
1. Property 1: Email validation for all string inputs
2. Property 2: Token uniqueness across multiple generations
3. Property 3: Token expiry time consistency
4. Property 4: Old token cleanup for any email
5. Property 5: Response consistency for any email
6. Property 7: Reset URL format for any token
7. Property 8: Email content completeness
8. Property 16: Password length validation for any string
9. Property 17: Password hashing round trip
10. Property 22: Token UUID format validation

**Integration Tests:**
1. Full forgot password flow (request → email → reset)
2. Email service integration with real SMTP (optional, in CI)
3. Database transaction handling
4. Concurrent token requests for same email

### Mocking Strategy

**Email Service:**
```typescript
// Mock for unit tests
const mockEmailService = {
  sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
};

// Spy for property tests
const emailServiceSpy = vi.spyOn(emailService, 'sendPasswordResetEmail');
```

**Database:**
```typescript
// Use in-memory SQLite for fast tests
// Or mock Prisma client for isolated unit tests
const mockPrisma = {
  passwordResetToken: {
    create: vi.fn(),
    findUnique: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
};
```

### Test Data Generators

**For Property-Based Tests:**
```typescript
// Custom arbitraries for fast-check
const validEmail = fc.emailAddress();
const invalidEmail = fc.string().filter(s => !isValidEmail(s));
const validPassword = fc.string({ minLength: 6, maxLength: 100 });
const invalidPassword = fc.string({ maxLength: 5 });
const uuid = fc.uuid();
const expiredDate = fc.date({ max: new Date() });
const futureDate = fc.date({ min: new Date() });
```

### Performance Considerations

**Test Execution Time:**
- Unit tests: < 5 seconds total
- Property tests: < 30 seconds total (100 runs each)
- Integration tests: < 60 seconds total

**Optimization:**
- Use in-memory database for tests
- Mock email service by default
- Parallel test execution where possible
- Cache bcrypt hashing in tests (use lower salt rounds)

