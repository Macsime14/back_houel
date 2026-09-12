import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { errorResponse } from "@/lib/api";
import { z } from "zod";
import { createFactureFromDevis, listFactures } from "@/services/facture.service";

const createFactureSchema = z.object({ devisId: z.string().min(1) });

/**
 * @swagger
 * /api/factures:
 *   get:
 *     tags: [Factures]
 *     summary: Liste toutes les factures
 *     responses:
 *       200:
 *         description: Liste des factures
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Facture'
 */
export async function GET() {
  const factures = await listFactures();
  return NextResponse.json(factures);
}

/**
 * @swagger
 * /api/factures:
 *   post:
 *     tags: [Factures]
 *     summary: Transforme un devis accepté en facture brouillon
 *     description: >
 *       Copie les lignes du devis. La facture reste modifiable tant qu'elle
 *       n'a pas été émise via /api/factures/{id}/emettre.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [devisId]
 *             properties:
 *               devisId: { type: string }
 *     responses:
 *       201:
 *         description: Facture brouillon créée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Facture'
 *       400:
 *         description: Devis non accepté, déjà facturé, ou introuvable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();
    const { devisId } = createFactureSchema.parse(body);
    const facture = await createFactureFromDevis(devisId, session!.user.id);
    return NextResponse.json(facture, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
