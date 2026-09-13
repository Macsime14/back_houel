-- CreateTable
CREATE TABLE "EntrepriseSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "nom" TEXT NOT NULL DEFAULT 'Houel Plombier',
    "statutJuridique" TEXT,
    "siret" TEXT,
    "numeroTVA" TEXT,
    "adresse" TEXT,
    "telephone" TEXT,
    "email" TEXT,
    "iban" TEXT,
    "mentionsComplementaires" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EntrepriseSettings_pkey" PRIMARY KEY ("id")
);
