import { prisma } from "@/lib/prisma";
import type { z } from "zod";
import type { createPrestationSchema, updatePrestationSchema } from "@/lib/validation";

type CreatePrestationInput = z.infer<typeof createPrestationSchema>;
type UpdatePrestationInput = z.infer<typeof updatePrestationSchema>;

export function listPrestations() {
  return prisma.prestation.findMany({ orderBy: { designation: "asc" } });
}

export function getPrestation(id: string) {
  return prisma.prestation.findUnique({ where: { id } });
}

export function createPrestation(input: CreatePrestationInput) {
  return prisma.prestation.create({ data: input });
}

export function updatePrestation(id: string, input: UpdatePrestationInput) {
  return prisma.prestation.update({ where: { id }, data: input });
}

export function deletePrestation(id: string) {
  return prisma.prestation.delete({ where: { id } });
}
