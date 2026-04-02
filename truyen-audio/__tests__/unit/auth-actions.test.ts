import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { requestPasswordReset } from '../../app/actions/auth';
import { prisma } from '../../lib/prisma';
import * as emailModule from '../../lib/email';

// Mock prisma
vi.mock('../../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    passwordResetToken: {
      deleteMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// Mock email service
vi.mock('../../lib/email', async () => {
  const actual = await vi.importActual('../../lib/email');
  return {
    ...actual,
    createEmailService: vi.fn(() => ({
      sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
    })),
  };
});

describe('requestPasswordReset', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should validate email format with zod', async () => {
    const result = await requestPasswordReset({ email: 'invalid-email' });
    
    // Security: Should return success message even for invalid email
    expect(result.success).toBe(true);
    expect(result.message).toBe('Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu.');
    
    // Should not query database for invalid email
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('should return success message for non-existent email (security)', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const result = await requestPasswordReset({ email: 'nonexistent@example.com' });
    
    expect(result.success).toBe(true);
    expect(result.message).toBe('Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu.');
    expect(prisma.passwordResetToken.create).not.toHaveBeenCalled();
  });

  it('should create token and send email for existing user', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      password: 'hashed',
      name: 'Test User',
      role: 'USER' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      vipExpiresAt: null,
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
    vi.mocked(prisma.passwordResetToken.deleteMany).mockResolvedValue({ count: 0 });
    vi.mocked(prisma.passwordResetToken.create).mockResolvedValue({
      id: 'token-123',
      email: mockUser.email,
      token: 'test-token',
      expiresAt: new Date(Date.now() + 3600000),
      createdAt: new Date(),
    });

    const mockEmailService = {
      sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
    };
    vi.mocked(emailModule.createEmailService).mockReturnValue(mockEmailService as any);

    const result = await requestPasswordReset({ email: mockUser.email });
    
    expect(result.success).toBe(true);
    expect(result.message).toBe('Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu.');
    
    // Verify old tokens were deleted
    expect(prisma.passwordResetToken.deleteMany).toHaveBeenCalledWith({
      where: { email: mockUser.email },
    });
    
    // Verify new token was created
    expect(prisma.passwordResetToken.create).toHaveBeenCalled();
    
    // Verify email was sent
    expect(mockEmailService.sendPasswordResetEmail).toHaveBeenCalledWith({
      to: mockUser.email,
      resetUrl: expect.stringContaining('/reset-password?token='),
      expiryHours: 1,
    });
  });

  it('should handle email sending errors gracefully', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      password: 'hashed',
      name: 'Test User',
      role: 'USER' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      vipExpiresAt: null,
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
    vi.mocked(prisma.passwordResetToken.deleteMany).mockResolvedValue({ count: 0 });
    vi.mocked(prisma.passwordResetToken.create).mockResolvedValue({
      id: 'token-123',
      email: mockUser.email,
      token: 'test-token',
      expiresAt: new Date(Date.now() + 3600000),
      createdAt: new Date(),
    });

    const mockEmailService = {
      sendPasswordResetEmail: vi.fn().mockRejectedValue(new Error('SMTP connection failed')),
    };
    vi.mocked(emailModule.createEmailService).mockReturnValue(mockEmailService as any);

    const result = await requestPasswordReset({ email: mockUser.email });
    
    expect(result.success).toBe(false);
    expect(result.message).toBe('Không thể gửi email. Vui lòng thử lại sau.');
  });

  it('should handle unexpected errors', async () => {
    vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error('Database connection failed'));

    const result = await requestPasswordReset({ email: 'test@example.com' });
    
    expect(result.success).toBe(false);
    expect(result.message).toBe('Đã xảy ra lỗi. Vui lòng thử lại sau.');
  });
});
