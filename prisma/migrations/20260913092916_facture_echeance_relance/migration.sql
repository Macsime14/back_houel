-- AlterTable
ALTER TABLE "EntrepriseSettings" ADD COLUMN     "delaiPaiementJours" INTEGER NOT NULL DEFAULT 30;

-- AlterTable
ALTER TABLE "Facture" ADD COLUMN     "dateEcheance" TIMESTAMP(3),
ADD COLUMN     "derniereRelanceAt" TIMESTAMP(3);
