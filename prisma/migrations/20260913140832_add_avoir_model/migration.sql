-- CreateEnum
CREATE TYPE "AvoirStatus" AS ENUM ('BROUILLON', 'EMISE');

-- CreateTable
CREATE TABLE "Avoir" (
    "id" TEXT NOT NULL,
    "numero" INTEGER,
    "status" "AvoirStatus" NOT NULL DEFAULT 'BROUILLON',
    "verrouillee" BOOLEAN NOT NULL DEFAULT false,
    "factureId" TEXT NOT NULL,
    "motif" TEXT,
    "clientNom" TEXT NOT NULL,
    "clientEmail" TEXT,
    "clientAdresse" TEXT,
    "mentionsLegales" TEXT,
    "totalHT" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalTTC" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "emiseAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Avoir_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LigneAvoir" (
    "id" TEXT NOT NULL,
    "avoirId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantite" DECIMAL(10,2) NOT NULL,
    "prixUnitaireHT" DECIMAL(10,2) NOT NULL,
    "tauxTVA" DECIMAL(4,2) NOT NULL DEFAULT 20,
    "ordre" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "LigneAvoir_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvoirCounter" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "dernierNumero" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AvoirCounter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Avoir_numero_key" ON "Avoir"("numero");

-- AddForeignKey
ALTER TABLE "Avoir" ADD CONSTRAINT "Avoir_factureId_fkey" FOREIGN KEY ("factureId") REFERENCES "Facture"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avoir" ADD CONSTRAINT "Avoir_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LigneAvoir" ADD CONSTRAINT "LigneAvoir_avoirId_fkey" FOREIGN KEY ("avoirId") REFERENCES "Avoir"("id") ON DELETE CASCADE ON UPDATE CASCADE;
