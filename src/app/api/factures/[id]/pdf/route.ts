import { NextRequest, NextResponse } from "next/server";
import { renderFacturePdf } from "@/lib/pdf/render";

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
  const result = await renderFacturePdf(id);

  if (!result) {
    return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(result.buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${result.filename}"`,
    },
  });
}
