import { NextRequest, NextResponse } from "next/server";
import { renderDevisPdf } from "@/lib/pdf/render";

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
  const result = await renderDevisPdf(id);

  if (!result) {
    return NextResponse.json({ error: "Devis introuvable" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(result.buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${result.filename}"`,
    },
  });
}
