import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "../src/lib/password";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Compteur de numérotation légale des factures : doit exister avant la
  // première émission de facture (voir facture.service.ts).
  await prisma.factureCounter.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, dernierNumero: 0 },
  });

  const ownerEmail = process.env.SEED_OWNER_EMAIL;
  const ownerPassword = process.env.SEED_OWNER_PASSWORD;

  if (ownerEmail && ownerPassword) {
    await prisma.user.upsert({
      where: { email: ownerEmail },
      update: {},
      create: {
        email: ownerEmail,
        name: "Antoine",
        role: "OWNER",
        passwordHash: await hashPassword(ownerPassword),
      },
    });
    console.log(`Compte propriétaire créé/vérifié pour ${ownerEmail}`);
  } else {
    console.log(
      "SEED_OWNER_EMAIL / SEED_OWNER_PASSWORD non définis : aucun compte utilisateur créé.",
    );
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
