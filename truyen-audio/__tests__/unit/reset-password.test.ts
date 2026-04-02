import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { resetPassword } from '../../app/actions/auth';
import { prisma } from '../../lib/prisma';
import bcrypt from 'bcryptjs';

// Mock prisma
vi.mock('../../lib/prisma', () => ({
  prisma: {
    passwordResetToken: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Mock bcrypt
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

describe('resetPassword - Requirements Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Password Validation (Requirement 4.1)', () => {
    it('should reject passwords shorter than 6 characters', async () => {
      const result = await resetPassword({
        token: 'valid-token',
        password: '12345', // 5 characters
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Mật khẩu phải có ít nhất 6 ký tự');
      expect(prisma.passwordResetToken.findUnique).not.toHaveBeenCalled();
    });

    it('should accept passwords with exactly 6 characters', async () => {
      const mockToken = {
        id: 'token-123',
        email: 'test@example.com',
        token: 'valid-token',
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
        createdAt: new Date(),
      };

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        password: 'old-hashed-password',
        name: 'Test User',
        role: 'USER' as const,
        isBanned: false,
        vipExpiredAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValue(mockToken);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      vi.mocked(bcrypt.hash).mockResolvedValue('new-hashed-password' as never);
      vi.mocked(prisma.user.update).mockResolvedValue(mockUser);
      vi.mocked(prisma.passwordResetToken.delete).mockResolvedValue(mockToken);

      const result = await resetPassword({
        token: 'valid-token',
        password: '123456', // exactly 6 characters
      });

      expect(result.success).toBe(true);
    });

    it('should accept passwords longer than 6 characters', async () => {
      const mockToken = {
        id: 'token-123',
        email: 'test@example.com',
        token: 'valid-token',
        expiresAt: new Date(Date.now() + 3600000),
        createdAt: new Date(),
      };

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        password: 'old-hashed-password',
        name: 'Test User',
        role: 'USER' as const,
        isBanned: false,
        vipExpiredAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValue(mockToken);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      vi.mocked(bcrypt.hash).mockResolvedValue('new-hashed-password' as never);
      vi.mocked(prisma.user.update).mockResolvedValue(mockUser);
      vi.mocked(prisma.passwordResetToken.delete).mockResolvedValue(mockToken);

      const result = await resetPassword({
        token: 'valid-token',
        password: 'verylongpassword123',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('Token Validation Logic (Requirements 3.1, 3.2)', () => {
    it('should check token existence in database', async () => {
      vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValue(null);

      const result = await resetPassword({
        token: 'non-existent-token',
        password: 'validpassword',
      });

      expect(prisma.passwordResetToken.findUnique).toHaveBeenCalledWith({
        where: { token: 'non-existent-token' },
      });
      expect(result.success).toBe(false);
      expect(result.message).toBe('Token không hợp lệ hoặc đã hết hạn');
    });

    it('should return error for non-existent token', async () => {
      vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValue(null);

      const result = await resetPassword({
        token: 'invalid-token',
        password: 'validpassword',
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Token không hợp lệ hoặc đã hết hạn');
    });
  });

  describe('Token Expiry Handling (Requirements 3.3, 3.4)', () => {
    it('should check token expiry time', async () => {
      const expiredToken = {
        id: 'token-123',
        email: 'test@example.com',
        token: 'expired-token',
        expiresAt: new Date(Date.now() - 1000), // expired 1 second ago
        createdAt: new Date(),
      };

      vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValue(expiredToken);
      vi.mocked(prisma.passwordResetToken.delete).mockResolvedValue(expiredToken);

      const result = await resetPassword({
        token: 'expired-token',
        password: 'validpassword',
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Token không hợp lệ hoặc đã hết hạn');
    });

    it('should delete expired token from database', async () => {
      const expiredToken = {
        id: 'token-123',
        email: 'test@example.com',
        token: 'expired-token',
        expiresAt: new Date(Date.now() - 1000),
        createdAt: new Date(),
      };

      vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValue(expiredToken);
      vi.mocked(prisma.passwordResetToken.delete).mockResolvedValue(expiredToken);

      await resetPassword({
        token: 'expired-token',
        password: 'validpassword',
      });

      expect(prisma.passwordResetToken.delete).toHaveBeenCalledWith({
        where: { token: 'expired-token' },
      });
    });

    it('should accept token that has not expired yet', async () => {
      const validToken = {
        id: 'token-123',
        email: 'test@example.com',
        token: 'valid-token',
        expiresAt: new Date(Date.now() + 3600000), // expires in 1 hour
        createdAt: new Date(),
      };

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        password: 'old-hashed-password',
        name: 'Test User',
        role: 'USER' as const,
        isBanned: false,
        vipExpiredAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValue(validToken);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      vi.mocked(bcrypt.hash).mockResolvedValue('new-hashed-password' as never);
      vi.mocked(prisma.user.update).mockResolvedValue(mockUser);
      vi.mocked(prisma.passwordResetToken.delete).mockResolvedValue(validToken);

      const result = await resetPassword({
        token: 'valid-token',
        password: 'newpassword',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('Token Deletion After Use (Requirements 4.4, 5.6)', () => {
    it('should delete token after successful password reset', async () => {
      const mockToken = {
        id: 'token-123',
        email: 'test@example.com',
        token: 'valid-token',
        expiresAt: new Date(Date.now() + 3600000),
        createdAt: new Date(),
      };

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        password: 'old-hashed-password',
        name: 'Test User',
        role: 'USER' as const,
        isBanned: false,
        vipExpiredAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValue(mockToken);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      vi.mocked(bcrypt.hash).mockResolvedValue('new-hashed-password' as never);
      vi.mocked(prisma.user.update).mockResolvedValue(mockUser);
      vi.mocked(prisma.passwordResetToken.delete).mockResolvedValue(mockToken);

      await resetPassword({
        token: 'valid-token',
        password: 'newpassword',
      });

      expect(prisma.passwordResetToken.delete).toHaveBeenCalledWith({
        where: { token: 'valid-token' },
      });
    });

    it('should delete token immediately after password update', async () => {
      const mockToken = {
        id: 'token-123',
        email: 'test@example.com',
        token: 'valid-token',
        expiresAt: new Date(Date.now() + 3600000),
        createdAt: new Date(),
      };

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        password: 'old-hashed-password',
        name: 'Test User',
        role: 'USER' as const,
        isBanned: false,
        vipExpiredAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const deleteOrder: string[] = [];

      vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValue(mockToken);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      vi.mocked(bcrypt.hash).mockResolvedValue('new-hashed-password' as never);
      vi.mocked(prisma.user.update).mockImplementation(async () => {
        deleteOrder.push('update');
        return mockUser;
      });
      vi.mocked(prisma.passwordResetToken.delete).mockImplementation(async () => {
        deleteOrder.push('delete');
        return mockToken;
      });

      await resetPassword({
        token: 'valid-token',
        password: 'newpassword',
      });

      // Verify delete happens after update
      expect(deleteOrder).toEqual(['update', 'delete']);
    });
  });

  describe('Orphaned Token Handling (Requirement 4.6)', () => {
    it('should handle token with non-existent user', async () => {
      const mockToken = {
        id: 'token-123',
        email: 'deleted-user@example.com',
        token: 'orphaned-token',
        expiresAt: new Date(Date.now() + 3600000),
        createdAt: new Date(),
      };

      vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValue(mockToken);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null); // User doesn't exist
      vi.mocked(prisma.passwordResetToken.delete).mockResolvedValue(mockToken);

      const result = await resetPassword({
        token: 'orphaned-token',
        password: 'newpassword',
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Token không hợp lệ hoặc đã hết hạn');
    });

    it('should delete orphaned token', async () => {
      const mockToken = {
        id: 'token-123',
        email: 'deleted-user@example.com',
        token: 'orphaned-token',
        expiresAt: new Date(Date.now() + 3600000),
        createdAt: new Date(),
      };

      vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValue(mockToken);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.passwordResetToken.delete).mockResolvedValue(mockToken);

      await resetPassword({
        token: 'orphaned-token',
        password: 'newpassword',
      });

      expect(prisma.passwordResetToken.delete).toHaveBeenCalledWith({
        where: { token: 'orphaned-token' },
      });
    });
  });

  describe('Password Hashing (Requirement 4.2)', () => {
    it('should hash password with bcrypt', async () => {
      const mockToken = {
        id: 'token-123',
        email: 'test@example.com',
        token: 'valid-token',
        expiresAt: new Date(Date.now() + 3600000),
        createdAt: new Date(),
      };

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        password: 'old-hashed-password',
        name: 'Test User',
        role: 'USER' as const,
        isBanned: false,
        vipExpiredAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValue(mockToken);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      vi.mocked(bcrypt.hash).mockResolvedValue('new-hashed-password' as never);
      vi.mocked(prisma.user.update).mockResolvedValue(mockUser);
      vi.mocked(prisma.passwordResetToken.delete).mockResolvedValue(mockToken);

      await resetPassword({
        token: 'valid-token',
        password: 'mynewpassword',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('mynewpassword', 10);
    });

    it('should use salt rounds of 10', async () => {
      const mockToken = {
        id: 'token-123',
        email: 'test@example.com',
        token: 'valid-token',
        expiresAt: new Date(Date.now() + 3600000),
        createdAt: new Date(),
      };

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        password: 'old-hashed-password',
        name: 'Test User',
        role: 'USER' as const,
        isBanned: false,
        vipExpiredAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValue(mockToken);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      vi.mocked(bcrypt.hash).mockResolvedValue('new-hashed-password' as never);
      vi.mocked(prisma.user.update).mockResolvedValue(mockUser);
      vi.mocked(prisma.passwordResetToken.delete).mockResolvedValue(mockToken);

      await resetPassword({
        token: 'valid-token',
        password: 'testpassword',
      });

      const hashCall = vi.mocked(bcrypt.hash).mock.calls[0];
      expect(hashCall[1]).toBe(10); // salt rounds
    });
  });

  describe('Password Update (Requirement 4.3)', () => {
    it('should update user password in database', async () => {
      const mockToken = {
        id: 'token-123',
        email: 'test@example.com',
        token: 'valid-token',
        expiresAt: new Date(Date.now() + 3600000),
        createdAt: new Date(),
      };

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        password: 'old-hashed-password',
        name: 'Test User',
        role: 'USER' as const,
        isBanned: false,
        vipExpiredAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValue(mockToken);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      vi.mocked(bcrypt.hash).mockResolvedValue('new-hashed-password' as never);
      vi.mocked(prisma.user.update).mockResolvedValue(mockUser);
      vi.mocked(prisma.passwordResetToken.delete).mockResolvedValue(mockToken);

      await resetPassword({
        token: 'valid-token',
        password: 'newpassword',
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { password: 'new-hashed-password' },
      });
    });

    it('should update password for correct user based on token email', async () => {
      const mockToken = {
        id: 'token-123',
        email: 'correct@example.com',
        token: 'valid-token',
        expiresAt: new Date(Date.now() + 3600000),
        createdAt: new Date(),
      };

      const mockUser = {
        id: 'user-456',
        email: 'correct@example.com',
        password: 'old-hashed-password',
        name: 'Correct User',
        role: 'USER' as const,
        isBanned: false,
        vipExpiredAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValue(mockToken);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      vi.mocked(bcrypt.hash).mockResolvedValue('new-hashed-password' as never);
      vi.mocked(prisma.user.update).mockResolvedValue(mockUser);
      vi.mocked(prisma.passwordResetToken.delete).mockResolvedValue(mockToken);

      await resetPassword({
        token: 'valid-token',
        password: 'newpassword',
      });

      // Verify user lookup by email from token
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockToken.email },
      });

      // Verify update for correct user
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { password: 'new-hashed-password' },
      });
    });
  });

  describe('Success Response (Requirement 4.5)', () => {
    it('should return success message after password reset', async () => {
      const mockToken = {
        id: 'token-123',
        email: 'test@example.com',
        token: 'valid-token',
        expiresAt: new Date(Date.now() + 3600000),
        createdAt: new Date(),
      };

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        password: 'old-hashed-password',
        name: 'Test User',
        role: 'USER' as const,
        isBanned: false,
        vipExpiredAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValue(mockToken);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      vi.mocked(bcrypt.hash).mockResolvedValue('new-hashed-password' as never);
      vi.mocked(prisma.user.update).mockResolvedValue(mockUser);
      vi.mocked(prisma.passwordResetToken.delete).mockResolvedValue(mockToken);

      const result = await resetPassword({
        token: 'valid-token',
        password: 'newpassword',
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Mật khẩu đã được đặt lại thành công');
    });
  });

  describe('Integration - Full Flow', () => {
    it('should complete full password reset flow successfully', async () => {
      const mockToken = {
        id: 'token-123',
        email: 'user@example.com',
        token: 'valid-token-uuid',
        expiresAt: new Date(Date.now() + 3600000),
        createdAt: new Date(),
      };

      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        password: 'old-hashed-password',
        name: 'Test User',
        role: 'USER' as const,
        isBanned: false,
        vipExpiredAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValue(mockToken);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      vi.mocked(bcrypt.hash).mockResolvedValue('new-hashed-password' as never);
      vi.mocked(prisma.user.update).mockResolvedValue(mockUser);
      vi.mocked(prisma.passwordResetToken.delete).mockResolvedValue(mockToken);

      const result = await resetPassword({
        token: 'valid-token-uuid',
        password: 'mynewsecurepassword',
      });

      // Verify all steps executed in correct order
      expect(prisma.passwordResetToken.findUnique).toHaveBeenCalledWith({
        where: { token: 'valid-token-uuid' },
      });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockToken.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('mynewsecurepassword', 10);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { password: 'new-hashed-password' },
      });
      expect(prisma.passwordResetToken.delete).toHaveBeenCalledWith({
        where: { token: 'valid-token-uuid' },
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Mật khẩu đã được đặt lại thành công');
    });
  });
});
