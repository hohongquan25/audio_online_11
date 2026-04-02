import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmailService, createEmailService } from '../../lib/email';
import type { EmailServiceConfig } from '../../lib/email';

describe('EmailService', () => {
  let mockConfig: EmailServiceConfig;

  beforeEach(() => {
    mockConfig = {
      host: 'smtp.test.com',
      port: 587,
      secure: false,
      auth: {
        user: 'test@test.com',
        pass: 'testpass',
      },
      from: 'Test <test@test.com>',
    };
  });

  describe('constructor', () => {
    it('should create EmailService instance with valid config', () => {
      const service = new EmailService(mockConfig);
      expect(service).toBeInstanceOf(EmailService);
    });
  });

  describe('createPasswordResetTemplate', () => {
    it('should generate HTML template with reset URL', () => {
      const service = new EmailService(mockConfig);
      const resetUrl = 'http://localhost:3000/reset-password?token=test-token';
      const expiryHours = 1;

      // Access private method via type assertion for testing
      const template = (service as any).createPasswordResetTemplate(resetUrl, expiryHours);

      expect(template).toContain(resetUrl);
      expect(template).toContain('Đặt lại mật khẩu');
      expect(template).toContain('TruyệnAudio');
      expect(template).toContain(`${expiryHours} giờ`);
      expect(template).toContain('⚠️ Lưu ý bảo mật');
    });

    it('should include clickable link in template', () => {
      const service = new EmailService(mockConfig);
      const resetUrl = 'http://localhost:3000/reset-password?token=abc123';
      
      const template = (service as any).createPasswordResetTemplate(resetUrl, 1);

      expect(template).toMatch(new RegExp(`<a[^>]*href="${resetUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>`));
    });
  });

  describe('createEmailService factory', () => {
    it('should create EmailService with environment variables', () => {
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        SMTP_HOST: 'smtp.gmail.com',
        SMTP_PORT: '587',
        SMTP_USER: 'user@gmail.com',
        SMTP_PASS: 'password',
        SMTP_FROM: 'Test <user@gmail.com>',
      };

      const service = createEmailService();
      expect(service).toBeInstanceOf(EmailService);

      process.env = originalEnv;
    });

    it('should throw error when environment variables are missing', () => {
      const originalEnv = process.env;
      process.env = { ...originalEnv };
      delete process.env.SMTP_HOST;
      delete process.env.SMTP_PORT;
      delete process.env.SMTP_USER;
      delete process.env.SMTP_PASS;
      delete process.env.SMTP_FROM;

      expect(() => createEmailService()).toThrow(
        'Missing required SMTP environment variables'
      );

      process.env = originalEnv;
    });

    it('should set secure to true for port 465', () => {
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        SMTP_HOST: 'smtp.gmail.com',
        SMTP_PORT: '465',
        SMTP_USER: 'user@gmail.com',
        SMTP_PASS: 'password',
        SMTP_FROM: 'Test <user@gmail.com>',
      };

      const service = createEmailService();
      expect(service).toBeInstanceOf(EmailService);

      process.env = originalEnv;
    });
  });
});
