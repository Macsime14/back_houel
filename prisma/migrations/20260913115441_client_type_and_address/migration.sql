-- CreateEnum
CREATE TYPE "ClientType" AS ENUM ('PARTICULIER', 'PROFESSIONNEL');

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "codePostal" TEXT,
ADD COLUMN     "type" "ClientType" NOT NULL DEFAULT 'PARTICULIER',
ADD COLUMN     "ville" TEXT;
