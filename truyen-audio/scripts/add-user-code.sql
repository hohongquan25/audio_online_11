-- Add code field to User table
-- This migration adds a unique code field for new users
-- Existing users will have empty string as default

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "code" TEXT NOT NULL DEFAULT '';

-- Create unique index on code field (only for non-empty codes)
CREATE UNIQUE INDEX IF NOT EXISTS "User_code_key" ON "User"("code") WHERE "code" != '';
