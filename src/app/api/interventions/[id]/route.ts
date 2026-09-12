import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/api";
import { updateInterventionSchema } from "@/lib/validation";
import {
  deleteIntervention,
  getIntervention,
  updateIntervention,
} from "@/services/intervention.service";

type Params = { params: Promise<{ id: string }> };

/**
 * @swagger
 * /api/interventions/{id}:
 *   get:
 *     tags: [Interventions]
 *     summary: Récupère une intervention par son id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: L'intervention
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Intervention'
 *       404:
 *         description: Intervention introuvable
 */
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const intervention = await getIntervention(id);
  if (!intervention) {
    return NextResponse.json({ error: "Intervention introuvable" }, { status: 404 });
  }
  return NextResponse.json(intervention);
}

/**
 * @swagger
 * /api/interventions/{id}:
 *   patch:
 *     tags: [Interventions]
 *     summary: Met à jour une intervention
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
 *               titre: { type: string }
 *               debut: { type: string, format: date-time }
 *               fin: { type: string, format: date-time }
 *               devisId: { type: string }
 *               notes: { type: string }
 *               status:
 *                 type: string
 *                 enum: [PLANIFIEE, CONFIRMEE, TERMINEE, ANNULEE]
 *     responses:
 *       200:
 *         description: Intervention mise à jour
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
 *       404:
 *         description: Intervention introuvable
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const input = updateInterventionSchema.parse(body);
    const intervention = await updateIntervention(id, input);
    if (!intervention) {
      return NextResponse.json({ error: "Intervention introuvable" }, { status: 404 });
    }
    return NextResponse.json(intervention);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * @swagger
 * /api/interventions/{id}:
 *   delete:
 *     tags: [Interventions]
 *     summary: Supprime une intervention
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Intervention supprimée
 */
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await deleteIntervention(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
