type Ligne = {
  quantite: number;
  prixUnitaireHT: number;
  tauxTVA: number;
};

export function calculerTotaux(lignes: Ligne[]) {
  let totalHT = 0;
  let totalTTC = 0;

  for (const ligne of lignes) {
    const montantHT = ligne.quantite * ligne.prixUnitaireHT;
    totalHT += montantHT;
    totalTTC += montantHT * (1 + ligne.tauxTVA / 100);
  }

  return {
    totalHT: Math.round(totalHT * 100) / 100,
    totalTTC: Math.round(totalTTC * 100) / 100,
  };
}
