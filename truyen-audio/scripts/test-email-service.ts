/**
 * Manual test script for EmailService
 * Run with: npx tsx scripts/test-email-service.ts
 */

import { createEmailService } from '../lib/email';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testEmailService() {
  console.log('🧪 Testing EmailService...\n');

  try {
    // Create email service
    console.log('📧 Creating email service...');
    const emailService = createEmailService();
    console.log('✅ Email service created successfully\n');

    // Test email parameters
    const testEmail = process.env.SMTP_USER || 'test@example.com';
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=test-token-${Date.now()}`;
    
    console.log('📤 Sending test email...');
    console.log(`   To: ${testEmail}`);
    console.log(`   Reset URL: ${resetUrl}\n`);

    // Send test email
    await emailService.sendPasswordResetEmail({
      to: testEmail,
      resetUrl,
      expiryHours: 1,
    });

    console.log('✅ Email sent successfully!');
    console.log('\n📬 Please check your inbox for the password reset email.');
    
  } catch (error) {
    console.error('❌ Error testing email service:');
    console.error(error);
    process.exit(1);
  }
}

testEmailService();
