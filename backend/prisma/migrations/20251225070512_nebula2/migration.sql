-- AlterTable
ALTER TABLE "agents" ADD COLUMN     "provider" TEXT NOT NULL DEFAULT 'openai',
ALTER COLUMN "model" SET DEFAULT 'gpt-4.1';
