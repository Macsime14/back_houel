import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/api";
import { updateDevisSchema } from "@/lib/validation";
import { deleteDevis, getDevis, updateDevis } from "@/services/devis.service";

type Params = { params: Promise<{ id: string }> };

/**
 * @swagger
 * /api/devis/{id}:
 *   get:
 *     tags: [Devis]
 *     summary: Récupère un devis par son id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Le devis
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Devis'
 *       404:
 *         description: Devis introuvable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const devis = await getDevis(id);
  if (!devis) {
    return NextResponse.json({ error: "Devis introuvable" }, { status: 404 });
  }
  return NextResponse.json(devis);
}

/**
 * @swagger
 * /api/devis/{id}:
 *   patch:
 *     tags: [Devis]
 *     summary: Met à jour un devis (impossible s'il a déjà une facture associée)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clientNom: { type: string }
 *               clientEmail: { type: string }
 *               clientTelephone: { type: string }
 *               clientAdresse: { type: string }
 *               notes: { type: string }
 *               status:
 *                 type: string
 *                 enum: [BROUILLON, ENVOYE, ACCEPTE, REFUSE]
 *               lignes:
 *                 type: array
 *                 items: { $ref: '#/components/schemas/Ligne' }
 *     responses:
 *       200:
 *         description: Devis mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Devis'
 *       400:
 *         description: Données invalides, ou devis déjà transformé en facture
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Devis introuvable
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const input = updateDevisSchema.parse(body);
    const devis = await updateDevis(id, input);
    if (!devis) {
      return NextResponse.json({ error: "Devis introuvable" }, { status: 404 });
    }
    return NextResponse.json(devis);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * @swagger
 * /api/devis/{id}:
 *   delete:
 *     tags: [Devis]
 *     summary: Supprime un devis (impossible s'il a déjà une facture associée)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Devis supprimé
 *       400:
 *         description: Devis déjà transformé en facture
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Devis introuvable
 */
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const devis = await deleteDevis(id);
    if (!devis) {
      return NextResponse.json({ error: "Devis introuvable" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
