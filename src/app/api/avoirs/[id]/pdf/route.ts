import { NextRequest, NextResponse } from "next/server";
import { renderAvoirPdf } from "@/lib/pdf/render";

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
  const result = await renderAvoirPdf(id);

  if (!result) {
    return NextResponse.json({ error: "Avoir introuvable" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(result.buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${result.filename}"`,
    },
  });
}
