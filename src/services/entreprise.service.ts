import { prisma } from "@/lib/prisma";
import type { z } from "zod";
import type { updateEntrepriseSchema } from "@/lib/validation";

type UpdateEntrepriseInput = z.infer<typeof updateEntrepriseSchema>;

// Ligne unique : on la cree au premier acces si elle n'existe pas encore
// (aucun seed manuel a lancer).
export function getEntreprise() {
  return prisma.entrepriseSettings.upsert({
    where: { id: 1 },
    create: { id: 1 },
    update: {},
  });
}

export function updateEntreprise(input: UpdateEntrepriseInput) {
  return prisma.entrepriseSettings.upsert({
    where: { id: 1 },
    create: { id: 1, ...input },
    update: input,
  });
}

// Compose une suggestion de mentions legales a partir des coordonnees
// renseignees dans Parametres, pre-remplie (mais toujours modifiable) au
// moment de l'emission d'une facture.
export function composerMentionsLegales(entreprise: {
  nom: string;
  statutJuridique: string | null;
  siret: string | null;
  numeroTVA: string | null;
  adresse: string | null;
  mentionsComplementaires: string | null;
}) {
  const lignes = [entreprise.nom];
  if (entreprise.statutJuridique) lignes.push(entreprise.statutJuridique);
  if (entreprise.siret) lignes.push(`SIRET ${entreprise.siret}`);
  lignes.push(entreprise.numeroTVA ? `TVA ${entreprise.numeroTVA}` : "TVA non applicable, art. 293 B du CGI");
  if (entreprise.adresse) lignes.push(entreprise.adresse);
  if (entreprise.mentionsComplementaires) lignes.push(entreprise.mentionsComplementaires);
  return lignes.join(" — ");
}
