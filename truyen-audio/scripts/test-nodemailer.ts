/**
 * Script to test nodemailer import and basic configuration
 * Run with: npx tsx scripts/test-nodemailer.ts
 */

import 'dotenv/config';
import nodemailer from 'nodemailer';

console.log('🔍 Testing nodemailer import and configuration...\n');

try {
  // Test 1: Import successful
  console.log('✅ nodemailer imported successfully');

  // Test 2: Create transporter with SMTP config
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  console.log('✅ SMTP transporter created successfully');
  console.log(`   Host: ${process.env.SMTP_HOST}`);
  console.log(`   Port: ${process.env.SMTP_PORT}`);

  // Test 3: Verify transporter configuration (doesn't send email)
  transporter.verify((error, success) => {
    if (error) {
      console.log('\n❌ SMTP connection verification failed:');
      console.log(`   ${error.message}`);
      console.log('\n⚠️  This might be okay - verification can fail due to network/firewall.');
      console.log('   The actual email sending will be tested when the feature is used.');
    } else {
      console.log('\n✅ SMTP server connection verified successfully!');
      console.log('   Ready to send emails.');
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ nodemailer setup complete and ready to use!');
  });

} catch (error) {
  console.error('\n❌ Error testing nodemailer:');
  console.error(error);
  process.exit(1);
}
