-- Add is_public column to courses table
ALTER TABLE "courses" ADD COLUMN "is_public" BOOLEAN NOT NULL DEFAULT true;