import { prisma } from "@/lib/prisma";
import { calculerTotaux } from "@/lib/montants";
import type { Prisma } from "@/generated/prisma/client";

export function listFactures() {
  return prisma.facture.findMany({
    include: { lignes: true },
    orderBy: { createdAt: "desc" },
  });
}

export function getFacture(id: string) {
  return prisma.facture.findUnique({
    where: { id },
    include: { lignes: true, devis: true },
  });
}

// Transforme un devis accepté en facture brouillon (pas encore de numéro
// légal, pas encore verrouillée). Les lignes du devis sont copiées : la
// facture doit rester indépendante si le devis est modifié après coup
// (ce qui n'arrivera plus une fois la facture créée, cf. devis.service).
export async function createFactureFromDevis(devisId: string, createdById: string) {
  const devis = await prisma.devis.findUnique({
    where: { id: devisId },
    include: { lignes: true, facture: true },
  });

  if (!devis) {
    throw new Error("Devis introuvable");
  }
  if (devis.status !== "ACCEPTE") {
    throw new Error("Seul un devis accepté peut être transformé en facture");
  }
  if (devis.facture) {
    throw new Error("Ce devis a déjà une facture associée");
  }

  return prisma.facture.create({
    data: {
      devisId: devis.id,
      createdById,
      clientNom: devis.clientNom,
      clientEmail: devis.clientEmail,
      clientAdresse: devis.clientAdresse,
      totalHT: devis.totalHT,
      totalTTC: devis.totalTTC,
      lignes: {
        create: devis.lignes.map((ligne: (typeof devis.lignes)[number]) => ({
          description: ligne.description,
          quantite: ligne.quantite,
          prixUnitaireHT: ligne.prixUnitaireHT,
          tauxTVA: ligne.tauxTVA,
          ordre: ligne.ordre,
        })),
      },
    },
    include: { lignes: true },
  });
}

// Une facture brouillon reste modifiable (montants, lignes) tant qu'elle n'a
// pas été émise.
export async function updateFactureBrouillon(
  id: string,
  input: { lignes?: Array<{ description: string; quantite: number; prixUnitaireHT: number; tauxTVA: number }> },
) {
  const existing = await prisma.facture.findUnique({ where: { id } });
  if (!existing) {
    return null;
  }
  if (existing.verrouillee) {
    throw new Error("Cette facture a déjà été émise, elle ne peut plus être modifiée.");
  }

  if (!input.lignes) {
    return existing;
  }

  const { totalHT, totalTTC } = calculerTotaux(input.lignes);
  await prisma.ligneFacture.deleteMany({ where: { factureId: id } });

  return prisma.facture.update({
    where: { id },
    data: {
      totalHT,
      totalTTC,
      lignes: {
        create: input.lignes.map((ligne, index) => ({ ...ligne, ordre: index })),
      },
    },
    include: { lignes: true },
  });
}

export async function deleteFactureBrouillon(id: string) {
  const existing = await prisma.facture.findUnique({ where: { id } });
  if (!existing) {
    return null;
  }
  if (existing.verrouillee) {
    throw new Error("Cette facture a déjà été émise, elle ne peut plus être supprimée.");
  }
  return prisma.facture.delete({ where: { id } });
}

// Attribution du numéro légal + verrouillage définitif de la facture.
// Utilise un verrou transactionnel (SELECT ... FOR UPDATE) sur la ligne
// unique FactureCounter pour garantir une séquence strictement croissante
// sans trou, même en cas d'émissions concurrentes. La ligne FactureCounter
// (id=1) doit exister au préalable (créée par la migration d'initialisation).
export async function emettreFacture(id: string, mentionsLegales?: string) {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const facture = await tx.facture.findUnique({ where: { id } });
    if (!facture) {
      throw new Error("Facture introuvable");
    }
    if (facture.verrouillee) {
      throw new Error("Cette facture a déjà été émise");
    }

    await tx.$executeRaw`SELECT id FROM "FactureCounter" WHERE id = 1 FOR UPDATE`;
    const counter = await tx.factureCounter.update({
      where: { id: 1 },
      data: { dernierNumero: { increment: 1 } },
    });

    return tx.facture.update({
      where: { id },
      data: {
        numero: counter.dernierNumero,
        status: "EMISE",
        verrouillee: true,
        emiseAt: new Date(),
        mentionsLegales,
      },
      include: { lignes: true },
    });
  });
}

export async function marquerFacturePayee(id: string) {
  const facture = await prisma.facture.findUnique({ where: { id } });
  if (!facture) {
    throw new Error("Facture introuvable");
  }
  if (facture.status !== "EMISE") {
    throw new Error("Seule une facture émise peut être marquée comme payée");
  }

  return prisma.facture.update({
    where: { id },
    data: { status: "PAYEE", payeeAt: new Date() },
    include: { lignes: true },
  });
}
