-- CreateTable
CREATE TABLE "Prestation" (
    "id" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "prixUnitaireHT" DECIMAL(10,2) NOT NULL,
    "tauxTVA" DECIMAL(4,2) NOT NULL DEFAULT 20,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prestation_pkey" PRIMARY KEY ("id")
);
