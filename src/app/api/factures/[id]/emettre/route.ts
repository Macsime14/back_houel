import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/api";
import { z } from "zod";
import { emettreFacture } from "@/services/facture.service";

type Params = { params: Promise<{ id: string }> };

const emettreSchema = z.object({ mentionsLegales: z.string().optional() });

/**
 * @swagger
 * /api/factures/{id}/emettre:
 *   post:
 *     tags: [Factures]
 *     summary: Émet légalement la facture (action irréversible)
 *     description: >
 *       Attribue le numéro de facture séquentiel (via un compteur
 *       transactionnel verrouillé) et verrouille définitivement la facture :
 *       elle ne peut plus être modifiée ni supprimée après cet appel. Action
 *       séparée du PATCH générique pour éviter tout déclenchement accidentel.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mentionsLegales: { type: string }
 *     responses:
 *       200:
 *         description: Facture émise et verrouillée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Facture'
 *       400:
 *         description: Facture déjà émise, ou introuvable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { mentionsLegales } = emettreSchema.parse(body);
    const facture = await emettreFacture(id, mentionsLegales);
    return NextResponse.json(facture);
  } catch (error) {
    return errorResponse(error);
  }
}
