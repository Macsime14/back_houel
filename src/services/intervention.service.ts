import { prisma } from "@/lib/prisma";
import type { z } from "zod";
import type { createInterventionSchema, updateInterventionSchema } from "@/lib/validation";

type CreateInterventionInput = z.infer<typeof createInterventionSchema>;
type UpdateInterventionInput = z.infer<typeof updateInterventionSchema>;

export function listInterventions() {
  return prisma.intervention.findMany({
    include: { devis: true, client: true },
    orderBy: { debut: "asc" },
  });
}

export function getIntervention(id: string) {
  return prisma.intervention.findUnique({
    where: { id },
    include: { devis: true, client: true },
  });
}

export function createIntervention(input: CreateInterventionInput) {
  if (input.fin <= input.debut) {
    throw new Error("La date de fin doit être après la date de début");
  }
  return prisma.intervention.create({ data: input });
}

export async function updateIntervention(id: string, input: UpdateInterventionInput) {
  if (input.debut && input.fin && input.fin <= input.debut) {
    throw new Error("La date de fin doit être après la date de début");
  }
  const existing = await prisma.intervention.findUnique({ where: { id } });
  if (!existing) {
    return null;
  }
  return prisma.intervention.update({ where: { id }, data: input });
}

export function deleteIntervention(id: string) {
  return prisma.intervention.delete({ where: { id } });
}
