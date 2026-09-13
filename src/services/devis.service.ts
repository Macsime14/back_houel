import { prisma } from "@/lib/prisma";
import { calculerTotaux } from "@/lib/montants";
import type { z } from "zod";
import type { createDevisSchema, updateDevisSchema } from "@/lib/validation";

type CreateDevisInput = z.infer<typeof createDevisSchema>;
type UpdateDevisInput = z.infer<typeof updateDevisSchema>;

export function listDevis() {
  return prisma.devis.findMany({
    include: { lignes: true, facture: true },
    orderBy: { createdAt: "desc" },
  });
}

export function getDevis(id: string) {
  return prisma.devis.findUnique({
    where: { id },
    include: { lignes: true, facture: true, interventions: true, client: true },
  });
}

export function createDevis(input: CreateDevisInput, createdById: string) {
  const { totalHT, totalTTC } = calculerTotaux(input.lignes);

  return prisma.devis.create({
    data: {
      clientId: input.clientId,
      clientNom: input.clientNom,
      clientEmail: input.clientEmail,
      clientTelephone: input.clientTelephone,
      clientAdresse: input.clientAdresse,
      notes: input.notes,
      totalHT,
      totalTTC,
      createdById,
      lignes: {
        create: input.lignes.map((ligne, index) => ({ ...ligne, ordre: index })),
      },
    },
    include: { lignes: true },
  });
}

// Un devis facturé (accepté puis transformé en facture) ne doit plus être
// modifié : la facture référence son contenu au moment de l'émission.
export async function updateDevis(id: string, input: UpdateDevisInput) {
  const existing = await prisma.devis.findUnique({ where: { id }, include: { facture: true } });
  if (!existing) {
    return null;
  }
  if (existing.facture) {
    throw new Error("Ce devis a déjà été transformé en facture, il ne peut plus être modifié.");
  }

  const data: Record<string, unknown> = {
    clientId: input.clientId,
    clientNom: input.clientNom,
    clientEmail: input.clientEmail,
    clientTelephone: input.clientTelephone,
    clientAdresse: input.clientAdresse,
    notes: input.notes,
    status: input.status,
  };

  if (input.status === "ENVOYE" && !existing.envoyeAt) {
    data.envoyeAt = new Date();
  }
  if ((input.status === "ACCEPTE" || input.status === "REFUSE") && !existing.repondtAt) {
    data.repondtAt = new Date();
  }

  if (input.lignes) {
    const { totalHT, totalTTC } = calculerTotaux(input.lignes);
    data.totalHT = totalHT;
    data.totalTTC = totalTTC;
    await prisma.ligneDevis.deleteMany({ where: { devisId: id } });
    data.lignes = {
      create: input.lignes.map((ligne, index) => ({ ...ligne, ordre: index })),
    };
  }

  return prisma.devis.update({ where: { id }, data, include: { lignes: true } });
}

export async function deleteDevis(id: string) {
  const existing = await prisma.devis.findUnique({ where: { id }, include: { facture: true } });
  if (!existing) {
    return null;
  }
  if (existing.facture) {
    throw new Error("Ce devis a déjà été transformé en facture, il ne peut plus être supprimé.");
  }
  return prisma.devis.delete({ where: { id } });
}
