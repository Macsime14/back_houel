import { prisma } from "@/lib/prisma";

export type SearchResult = {
  id: string;
  label: string;
  sublabel: string;
  href: string;
};

export type SearchResults = {
  clients: SearchResult[];
  devis: SearchResult[];
  factures: SearchResult[];
  interventions: SearchResult[];
};

const LIMIT = 5;

export async function globalSearch(query: string): Promise<SearchResults> {
  const q = query.trim();
  if (q.length < 2) {
    return { clients: [], devis: [], factures: [], interventions: [] };
  }

  const numero = /^\d+$/.test(q) ? Number(q) : undefined;

  const [clients, devis, factures, interventions] = await Promise.all([
    prisma.client.findMany({
      where: {
        OR: [
          { nom: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      },
      take: LIMIT,
      orderBy: { nom: "asc" },
    }),
    prisma.devis.findMany({
      where: {
        OR: [
          { clientNom: { contains: q, mode: "insensitive" } },
          ...(numero !== undefined ? [{ numero }] : []),
        ],
      },
      take: LIMIT,
      orderBy: { createdAt: "desc" },
    }),
    prisma.facture.findMany({
      where: {
        OR: [
          { clientNom: { contains: q, mode: "insensitive" } },
          ...(numero !== undefined ? [{ numero }] : []),
        ],
      },
      take: LIMIT,
      orderBy: { createdAt: "desc" },
    }),
    prisma.intervention.findMany({
      where: { titre: { contains: q, mode: "insensitive" } },
      take: LIMIT,
      orderBy: { debut: "desc" },
    }),
  ]);

  return {
    clients: clients.map((c) => ({
      id: c.id,
      label: c.nom,
      sublabel: c.email ?? "Client",
      href: `/dashboard/clients/${c.id}`,
    })),
    devis: devis.map((d) => ({
      id: d.id,
      label: `Devis n°${d.numero}`,
      sublabel: d.clientNom,
      href: `/dashboard/devis/${d.id}`,
    })),
    factures: factures.map((f) => ({
      id: f.id,
      label: f.numero ? `Facture n°${f.numero}` : "Facture (brouillon)",
      sublabel: f.clientNom,
      href: `/dashboard/factures/${f.id}`,
    })),
    interventions: interventions.map((i) => ({
      id: i.id,
      label: i.titre,
      sublabel: i.debut.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      href: `/dashboard/interventions/${i.id}`,
    })),
  };
}
