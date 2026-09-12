import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { errorResponse } from "@/lib/api";
import { createDevisSchema } from "@/lib/validation";
import { createDevis, listDevis } from "@/services/devis.service";

/**
 * @swagger
 * /api/devis:
 *   get:
 *     tags: [Devis]
 *     summary: Liste tous les devis
 *     responses:
 *       200:
 *         description: Liste des devis
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Devis'
 */
export async function GET() {
  const devis = await listDevis();
  return NextResponse.json(devis);
}

/**
 * @swagger
 * /api/devis:
 *   post:
 *     tags: [Devis]
 *     summary: Crée un nouveau devis
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [clientNom, lignes]
 *             properties:
 *               clientNom: { type: string }
 *               clientEmail: { type: string }
 *               clientTelephone: { type: string }
 *               clientAdresse: { type: string }
 *               notes: { type: string }
 *               lignes:
 *                 type: array
 *                 items: { $ref: '#/components/schemas/Ligne' }
 *     responses:
 *       201:
 *         description: Devis créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Devis'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();
    const input = createDevisSchema.parse(body);
    const devis = await createDevis(input, session!.user.id);
    return NextResponse.json(devis, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
