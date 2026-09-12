import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/api";
import { createInterventionSchema } from "@/lib/validation";
import { createIntervention, listInterventions } from "@/services/intervention.service";

/**
 * @swagger
 * /api/interventions:
 *   get:
 *     tags: [Interventions]
 *     summary: Liste toutes les interventions (planning)
 *     responses:
 *       200:
 *         description: Liste des interventions, triées par date de début
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Intervention'
 */
export async function GET() {
  const interventions = await listInterventions();
  return NextResponse.json(interventions);
}

/**
 * @swagger
 * /api/interventions:
 *   post:
 *     tags: [Interventions]
 *     summary: Crée un créneau d'intervention
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [titre, debut, fin]
 *             properties:
 *               titre: { type: string }
 *               debut: { type: string, format: date-time }
 *               fin: { type: string, format: date-time }
 *               devisId: { type: string }
 *               notes: { type: string }
 *     responses:
 *       201:
 *         description: Intervention créée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Intervention'
 *       400:
 *         description: Données invalides (ex. fin avant début)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = createInterventionSchema.parse(body);
    const intervention = await createIntervention(input);
    return NextResponse.json(intervention, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
