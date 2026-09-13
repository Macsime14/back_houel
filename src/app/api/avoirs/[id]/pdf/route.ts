import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getAvoir } from "@/services/avoir.service";
import { getEntreprise } from "@/services/entreprise.service";
import { InvoiceDocument } from "@/lib/pdf/invoice-document";

type Params = { params: Promise<{ id: string }> };

/**
 * @swagger
 * /api/avoirs/{id}/pdf:
 *   get:
 *     tags: [Avoirs]
 *     summary: Génère le PDF d'un avoir
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Le PDF de l'avoir
 *         content:
 *           application/pdf: {}
 *       404:
 *         description: Avoir introuvable
 */
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const [avoir, entreprise] = await Promise.all([getAvoir(id), getEntreprise()]);

  if (!avoir) {
    return NextResponse.json({ error: "Avoir introuvable" }, { status: 404 });
  }

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
        prixUnitaireHT: Number(ligne.prixUnitaireHT),
        tauxTVA: Number(ligne.tauxTVA),
      })),
      totalHT: Number(avoir.totalHT),
      totalTTC: Number(avoir.totalTTC),
      notes,
      mentionsLegales: avoir.mentionsLegales,
    }),
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="avoir-${avoir.numero ?? "brouillon"}.pdf"`,
    },
  });
}
