-- AlterTable
ALTER TABLE "LigneAvoir" ADD COLUMN     "unite" TEXT NOT NULL DEFAULT 'unité';

-- AlterTable
ALTER TABLE "LigneDevis" ADD COLUMN     "unite" TEXT NOT NULL DEFAULT 'unité';

-- AlterTable
ALTER TABLE "LigneFacture" ADD COLUMN     "unite" TEXT NOT NULL DEFAULT 'unité';

-- AlterTable
ALTER TABLE "Prestation" ADD COLUMN     "unite" TEXT NOT NULL DEFAULT 'unité';
