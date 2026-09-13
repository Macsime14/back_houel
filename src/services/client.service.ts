import { prisma } from "@/lib/prisma";
import type { z } from "zod";
import type { createClientSchema, updateClientSchema } from "@/lib/validation";

type CreateClientInput = z.infer<typeof createClientSchema>;
type UpdateClientInput = z.infer<typeof updateClientSchema>;

export function listClients() {
  return prisma.client.findMany({
    include: { _count: { select: { devis: true } } },
    orderBy: { nom: "asc" },
  });
}

export function getClient(id: string) {
  return prisma.client.findUnique({
    where: { id },
    include: {
      devis: {
        include: { facture: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export function createClient(input: CreateClientInput) {
  return prisma.client.create({ data: input });
}

export function updateClient(id: string, input: UpdateClientInput) {
  return prisma.client.update({ where: { id }, data: input });
}

export function deleteClient(id: string) {
  return prisma.client.delete({ where: { id } });
}
