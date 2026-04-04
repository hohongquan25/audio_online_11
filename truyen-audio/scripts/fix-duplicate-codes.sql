-- Remove paymentCode column if it exists (from previous implementation)
ALTER TABLE "User" DROP COLUMN IF EXISTS "paymentCode";

-- Set all existing code values to NULL to avoid unique constraint violation
UPDATE "User" SET "code" = NULL WHERE "code" = '';
