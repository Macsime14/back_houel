import { listFactures } from "@/services/facture.service";
import { listAvoirs } from "@/services/avoir.service";
import { listDevis } from "@/services/devis.service";

// Même logique de net encaissé que le tableau de bord (voir dashboard/page.tsx) :
// un avoir émis dans le mois réduit le CA de ce mois-là, quel que soit le mois
// de la facture d'origine, puisque c'est le mois de l'avoir qui compte
// comptablement.
export async function getCAParMois(nbMois: number = 12) {
  const [factures, avoirs] = await Promise.all([listFactures(), listAvoirs()]);
  const now = new Date();

  const mois: { key: string; label: string; totalTTC: number }[] = [];
  for (let i = nbMois - 1; i >= 0; i--) {
    const debut = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const fin = new Date(debut.getFullYear(), debut.getMonth() + 1, 1);

    const encaisse = factures
      .filter((f) => f.status === "PAYEE" && f.payeeAt && f.payeeAt >= debut && f.payeeAt < fin)
      .reduce((sum, f) => sum + Number(f.totalTTC), 0);
    const avoirsMois = avoirs
      .filter((a) => a.status === "EMISE" && a.emiseAt && a.emiseAt >= debut && a.emiseAt < fin)
      .reduce((sum, a) => sum + Number(a.totalTTC), 0);

    mois.push({
      key: `${debut.getFullYear()}-${debut.getMonth()}`,
      label: debut.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }),
      totalTTC: encaisse - avoirsMois,
    });
  }
  return mois;
}

export async function getTopClients(limit: number = 5) {
  const factures = await listFactures();
  const parClient = new Map<string, number>();

  for (const facture of factures) {
    if (facture.status !== "PAYEE") continue;
    parClient.set(facture.clientNom, (parClient.get(facture.clientNom) ?? 0) + Number(facture.totalTTC));
  }

  return Array.from(parClient.entries())
    .map(([clientNom, totalTTC]) => ({ clientNom, totalTTC }))
    .sort((a, b) => b.totalTTC - a.totalTTC)
    .slice(0, limit);
}

export async function getStatsDevis() {
  const devis = await listDevis();
  const total = devis.length;
  const acceptes = devis.filter((d) => d.status === "ACCEPTE").length;
  const refuses = devis.filter((d) => d.status === "REFUSE").length;
  const enAttente = devis.filter((d) => d.status === "BROUILLON" || d.status === "ENVOYE").length;
  const statues = acceptes + refuses;

  return {
    total,
    acceptes,
    refuses,
    enAttente,
    tauxAcceptation: statues > 0 ? (acceptes / statues) * 100 : null,
  };
}
