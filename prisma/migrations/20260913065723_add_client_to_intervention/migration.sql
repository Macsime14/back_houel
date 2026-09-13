-- AlterTable
ALTER TABLE "Intervention" ADD COLUMN     "clientId" TEXT;

-- AddForeignKey
ALTER TABLE "Intervention" ADD CONSTRAINT "Intervention_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
