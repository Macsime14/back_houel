import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getFacture } from "@/services/facture.service";
import { getEntreprise } from "@/services/entreprise.service";
import { InvoiceDocument } from "@/lib/pdf/invoice-document";

type Params = { params: Promise<{ id: string }> };

/**
 * @swagger
 * /api/factures/{id}/pdf:
 *   get:
 *     tags: [Factures]
 *     summary: Génère le PDF d'une facture
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Le PDF de la facture
 *         content:
 *           application/pdf: {}
 *       404:
 *         description: Facture introuvable
 */
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const [facture, entreprise] = await Promise.all([getFacture(id), getEntreprise()]);

  if (!facture) {
    return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
  }

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

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="facture-${facture.numero ?? "brouillon"}.pdf"`,
    },
  });
}
