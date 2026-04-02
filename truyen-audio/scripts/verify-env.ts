/**
 * Script to verify SMTP environment variables are loaded correctly
 * Run with: npx tsx scripts/verify-env.ts
 */

import 'dotenv/config';

const requiredEnvVars = [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'SMTP_FROM',
  'NEXTAUTH_URL',
];

console.log('🔍 Verifying SMTP Environment Variables...\n');

let allPresent = true;

for (const envVar of requiredEnvVars) {
  const value = process.env[envVar];
  if (value) {
    // Mask sensitive values
    const displayValue = envVar.includes('PASS') 
      ? '***' + value.slice(-4) 
      : value;
    console.log(`✅ ${envVar}: ${displayValue}`);
  } else {
    console.log(`❌ ${envVar}: NOT SET`);
    allPresent = false;
  }
}

console.log('\n' + '='.repeat(50));

if (allPresent) {
  console.log('✅ All required SMTP environment variables are set!');
  console.log('\nSMTP Configuration:');
  console.log(`   Host: ${process.env.SMTP_HOST}`);
  console.log(`   Port: ${process.env.SMTP_PORT}`);
  console.log(`   User: ${process.env.SMTP_USER}`);
  console.log(`   From: ${process.env.SMTP_FROM}`);
  console.log(`   App URL: ${process.env.NEXTAUTH_URL}`);
  process.exit(0);
} else {
  console.log('❌ Some required environment variables are missing!');
  console.log('Please check your .env file.');
  process.exit(1);
}
