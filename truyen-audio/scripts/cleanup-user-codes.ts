import { prisma } from '../lib/prisma';

async function main() {
  console.log('Starting user code cleanup...');

  // First, drop the paymentCode column if it exists
  try {
    await prisma.$executeRaw`ALTER TABLE "User" DROP COLUMN IF EXISTS "paymentCode"`;
    console.log('✓ Dropped paymentCode column');
  } catch (error) {
    console.log('Note: paymentCode column may not exist');
  }

  // Set all empty codes to NULL
  const result = await prisma.$executeRaw`
    UPDATE "User" 
    SET "code" = NULL 
    WHERE "code" = '' OR "code" IS NULL
  `;
  
  console.log(`✓ Cleaned up ${result} user codes`);
  console.log('Done! You can now run: npx prisma db push');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
