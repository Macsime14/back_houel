import { prisma } from "@/lib/prisma";
import { calculerTotaux } from "@/lib/montants";
import type { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import type { createAvoirSchema, updateAvoirSchema } from "@/lib/validation";

type CreateAvoirInput = z.infer<typeof createAvoirSchema>;
type UpdateAvoirInput = z.infer<typeof updateAvoirSchema>;

export function listAvoirs() {
  return prisma.avoir.findMany({
    include: { lignes: true, facture: true },
    orderBy: { createdAt: "desc" },
  });
}

export function getAvoir(id: string) {
  return prisma.avoir.findUnique({
    where: { id },
    include: { lignes: true, facture: true },
  });
}

// Un avoir ne peut corriger qu'une facture déjà émise (immuable) : c'est
// justement pour ça qu'il existe. Les coordonnées client sont recopiées
// depuis la facture d'origine au moment de la création, sur le même
// principe que Facture.clientNom (voir schema.prisma).
export async function createAvoir(input: CreateAvoirInput, createdById: string) {
  const facture = await prisma.facture.findUnique({ where: { id: input.factureId } });
  if (!facture) {
    throw new Error("Facture introuvable");
  }
  if (!facture.verrouillee) {
    throw new Error("Seule une facture émise peut faire l'objet d'un avoir");
  }

  const { totalHT, totalTTC } = calculerTotaux(input.lignes);

  return prisma.avoir.create({
    data: {
      factureId: facture.id,
      createdById,
      motif: input.motif,
      clientNom: facture.clientNom,
      clientEmail: facture.clientEmail,
      clientAdresse: facture.clientAdresse,
      totalHT,
      totalTTC,
      lignes: {
        create: input.lignes.map((ligne, index) => ({ ...ligne, ordre: index })),
      },
    },
    include: { lignes: true },
  });
}

// Un avoir brouillon reste modifiable (motif, lignes, montants) tant qu'il
// n'a pas été émis.
export async function updateAvoirBrouillon(id: string, input: UpdateAvoirInput) {
  const existing = await prisma.avoir.findUnique({ where: { id } });
  if (!existing) {
    return null;
  }
  if (existing.verrouillee) {
    throw new Error("Cet avoir a déjà été émis, il ne peut plus être modifié.");
  }

  const totaux = input.lignes ? calculerTotaux(input.lignes) : undefined;

  if (input.lignes) {
    await prisma.ligneAvoir.deleteMany({ where: { avoirId: id } });
  }

  return prisma.avoir.update({
    where: { id },
    data: {
      motif: input.motif,
      ...(totaux ? { totalHT: totaux.totalHT, totalTTC: totaux.totalTTC } : {}),
      ...(input.lignes
        ? { lignes: { create: input.lignes.map((ligne, index) => ({ ...ligne, ordre: index })) } }
        : {}),
    },
    include: { lignes: true },
  });
}

export async function deleteAvoirBrouillon(id: string) {
  const existing = await prisma.avoir.findUnique({ where: { id } });
  if (!existing) {
    return null;
  }
  if (existing.verrouillee) {
    throw new Error("Cet avoir a déjà été émis, il ne peut plus être supprimé.");
  }
  return prisma.avoir.delete({ where: { id } });
}

// Attribution du numéro légal + verrouillage définitif, sur le même principe
// transactionnel que emettreFacture (voir facture.service.ts) : verrou
// SELECT ... FOR UPDATE sur AvoirCounter pour garantir une séquence
// strictement croissante sans trou, y compris en cas d'émissions concurrentes.
export async function emettreAvoir(id: string, mentionsLegales?: string) {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const avoir = await tx.avoir.findUnique({ where: { id } });
    if (!avoir) {
      throw new Error("Avoir introuvable");
    }
    if (avoir.verrouillee) {
      throw new Error("Cet avoir a déjà été émis");
    }

    await tx.$executeRaw`SELECT id FROM "AvoirCounter" WHERE id = 1 FOR UPDATE`;
    const counter = await tx.avoirCounter.update({
      where: { id: 1 },
      data: { dernierNumero: { increment: 1 } },
    });

    return tx.avoir.update({
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
