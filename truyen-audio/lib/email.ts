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

  constructor(config: EmailServiceConfig) {
    this.config = config;
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.auth.user,
        pass: config.auth.pass,
      },
    });
  }

  async sendPasswordResetEmail(params: SendPasswordResetEmailParams): Promise<void> {
    const { to, resetUrl, expiryHours } = params;

    try {
      const htmlContent = this.createPasswordResetTemplate(resetUrl, expiryHours);

      await this.transporter.sendMail({
        from: this.config.from,
        to,
        subject: 'Đặt lại mật khẩu - TruyệnAudio',
        html: htmlContent,
      });

      console.log(`[Email Service] Password reset email sent to: ${to}`);
    } catch (error) {
      console.error('[Email Service Error]', {
        type: 'SMTP_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        context: {
          host: this.config.host,
          port: this.config.port,
          user: this.config.auth.user,
          timestamp: new Date(),
        },
      });
      throw new Error('Failed to send password reset email');
    }
  }

  private createPasswordResetTemplate(resetUrl: string, expiryHours: number): string {
    return `
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
                    <a href="${resetUrl}" style="display: inline-block; padding: 14px 40px; color: #ffffff; text-decoration: none; font-weight: bold;">
                      Đặt lại mật khẩu
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 20px 0; color: #666; line-height: 1.6; font-size: 14px;">
                Hoặc copy link sau vào trình duyệt:<br>
                <a href="${resetUrl}" style="color: #7c3aed; word-break: break-all;">${resetUrl}</a>
              </p>
              <p style="margin: 20px 0; color: #999; font-size: 14px;">
                Link này sẽ hết hạn sau ${expiryHours} giờ.
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
    `.trim();
  }
}

export function createEmailService(): EmailService {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;

  if (!host || !port || !user || !pass || !from) {
    throw new Error(
      'Missing required SMTP environment variables: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM'
    );
  }

  const config: EmailServiceConfig = {
    host,
    port: parseInt(port, 10),
    secure: parseInt(port, 10) === 465, // Use TLS for port 465
    auth: {
      user,
      pass,
    },
    from,
  };

  return new EmailService(config);
}
