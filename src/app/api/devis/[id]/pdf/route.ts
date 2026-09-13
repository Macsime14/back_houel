import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getDevis } from "@/services/devis.service";
import { getEntreprise } from "@/services/entreprise.service";
import { InvoiceDocument } from "@/lib/pdf/invoice-document";

type Params = { params: Promise<{ id: string }> };

/**
 * @swagger
 * /api/devis/{id}/pdf:
 *   get:
 *     tags: [Devis]
 *     summary: Génère le PDF d'un devis
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Le PDF du devis
 *         content:
 *           application/pdf: {}
 *       404:
 *         description: Devis introuvable
 */
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const [devis, entreprise] = await Promise.all([getDevis(id), getEntreprise()]);

  if (!devis) {
    return NextResponse.json({ error: "Devis introuvable" }, { status: 404 });
  }

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
        prixUnitaireHT: Number(ligne.prixUnitaireHT),
        tauxTVA: Number(ligne.tauxTVA),
      })),
      totalHT: Number(devis.totalHT),
      totalTTC: Number(devis.totalTTC),
      notes: devis.notes,
    }),
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="devis-${devis.numero}.pdf"`,
    },
  });
}
