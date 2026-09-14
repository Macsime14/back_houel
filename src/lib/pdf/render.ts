import { renderToBuffer } from "@react-pdf/renderer";
import { getDevis } from "@/services/devis.service";
import { getFacture } from "@/services/facture.service";
import { getAvoir } from "@/services/avoir.service";
import { getEntreprise } from "@/services/entreprise.service";
import { InvoiceDocument } from "./invoice-document";

// Génération des PDF factorisée ici : utilisée à la fois par les routes de
// téléchargement (/api/.../pdf) et par l'envoi par email (voir email.ts),
// pour ne pas dupliquer la construction du document entre les deux usages.

export async function renderDevisPdf(id: string) {
  const [devis, entreprise] = await Promise.all([getDevis(id), getEntreprise()]);
  if (!devis) return null;

  const buffer = await renderToBuffer(
    InvoiceDocument({
      documentTitle: "Devis",
      numero: String(devis.numero),
      dateLabel: "Créé le",
      dateValue: devis.createdAt.toLocaleDateString("fr-FR"),
      entreprise: {
        nom: entreprise.nom,
        adresse: entreprise.adresse,
        siret: entreprise.siret,
        numeroTVA: entreprise.numeroTVA,
        telephone: entreprise.telephone,
        email: entreprise.email,
      },
      client: {
        nom: devis.clientNom,
        email: devis.clientEmail,
        telephone: devis.clientTelephone,
        adresse: devis.clientAdresse,
      },
      lignes: devis.lignes.map((ligne) => ({
        description: ligne.description,
        quantite: Number(ligne.quantite),
        unite: ligne.unite,
        prixUnitaireHT: Number(ligne.prixUnitaireHT),
        tauxTVA: Number(ligne.tauxTVA),
      })),
      totalHT: Number(devis.totalHT),
      totalTTC: Number(devis.totalTTC),
      notes: devis.notes,
    }),
  );

  return { buffer, filename: `devis-${devis.numero}.pdf`, devis, entreprise };
}

export async function renderFacturePdf(id: string) {
  const [facture, entreprise] = await Promise.all([getFacture(id), getEntreprise()]);
  if (!facture) return null;

  const buffer = await renderToBuffer(
    InvoiceDocument({
      documentTitle: facture.numero ? "Facture" : "Facture (brouillon)",
      numero: facture.numero ? String(facture.numero) : "—",
      dateLabel: facture.emiseAt ? "Émise le" : "Créée le",
      dateValue: (facture.emiseAt ?? facture.createdAt).toLocaleDateString("fr-FR"),
      dateEcheance: facture.dateEcheance?.toLocaleDateString("fr-FR"),
      entreprise: {
        nom: entreprise.nom,
        adresse: entreprise.adresse,
        siret: entreprise.siret,
        numeroTVA: entreprise.numeroTVA,
        telephone: entreprise.telephone,
        email: entreprise.email,
        iban: entreprise.iban,
      },
      client: {
        nom: facture.clientNom,
        email: facture.clientEmail,
        adresse: facture.clientAdresse,
      },
      lignes: facture.lignes.map((ligne) => ({
        description: ligne.description,
        quantite: Number(ligne.quantite),
        unite: ligne.unite,
        prixUnitaireHT: Number(ligne.prixUnitaireHT),
        tauxTVA: Number(ligne.tauxTVA),
      })),
      totalHT: Number(facture.totalHT),
      totalTTC: Number(facture.totalTTC),
      mentionsLegales: facture.mentionsLegales,
    }),
  );

  return { buffer, filename: `facture-${facture.numero ?? "brouillon"}.pdf`, facture, entreprise };
}

export async function renderAvoirPdf(id: string) {
  const [avoir, entreprise] = await Promise.all([getAvoir(id), getEntreprise()]);
  if (!avoir) return null;

  const reference = avoir.facture.numero
    ? `Avoir sur la facture n°${avoir.facture.numero}`
    : "Avoir sur facture brouillon";
  const notes = avoir.motif ? `${reference} — Motif : ${avoir.motif}` : reference;

  const buffer = await renderToBuffer(
    InvoiceDocument({
      documentTitle: "Avoir",
      numero: avoir.numero ? String(avoir.numero) : "—",
      dateLabel: avoir.emiseAt ? "Émis le" : "Créé le",
      dateValue: (avoir.emiseAt ?? avoir.createdAt).toLocaleDateString("fr-FR"),
      entreprise: {
        nom: entreprise.nom,
        adresse: entreprise.adresse,
        siret: entreprise.siret,
        numeroTVA: entreprise.numeroTVA,
        telephone: entreprise.telephone,
        email: entreprise.email,
        iban: entreprise.iban,
      },
      client: {
        nom: avoir.clientNom,
        email: avoir.clientEmail,
        adresse: avoir.clientAdresse,
      },
      lignes: avoir.lignes.map((ligne) => ({
        description: ligne.description,
        quantite: Number(ligne.quantite),
        unite: ligne.unite,
        prixUnitaireHT: Number(ligne.prixUnitaireHT),
        tauxTVA: Number(ligne.tauxTVA),
      })),
      totalHT: Number(avoir.totalHT),
      totalTTC: Number(avoir.totalTTC),
      notes,
      mentionsLegales: avoir.mentionsLegales,
    }),
  );

  return { buffer, filename: `avoir-${avoir.numero ?? "brouillon"}.pdf`, avoir, entreprise };
}
