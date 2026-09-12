import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/api";
import { z } from "zod";
import { ligneSchema } from "@/lib/validation";
import { deleteFactureBrouillon, getFacture, updateFactureBrouillon } from "@/services/facture.service";

type Params = { params: Promise<{ id: string }> };

const updateFactureSchema = z.object({ lignes: z.array(ligneSchema).min(1).optional() });

/**
 * @swagger
 * /api/factures/{id}:
 *   get:
 *     tags: [Factures]
 *     summary: Récupère une facture par son id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: La facture
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Facture'
 *       404:
 *         description: Facture introuvable
 */
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const facture = await getFacture(id);
  if (!facture) {
    return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
  }
  return NextResponse.json(facture);
}

/**
 * @swagger
 * /api/factures/{id}:
 *   patch:
 *     tags: [Factures]
 *     summary: Met à jour les lignes d'une facture brouillon (non émise)
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
 *               lignes:
 *                 type: array
 *                 items: { $ref: '#/components/schemas/Ligne' }
 *     responses:
 *       200:
 *         description: Facture mise à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Facture'
 *       400:
 *         description: Facture déjà émise, ne peut plus être modifiée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Facture introuvable
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const input = updateFactureSchema.parse(body);
    const facture = await updateFactureBrouillon(id, input);
    if (!facture) {
      return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
    }
    return NextResponse.json(facture);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * @swagger
 * /api/factures/{id}:
 *   delete:
 *     tags: [Factures]
 *     summary: Supprime une facture brouillon (non émise)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Facture supprimée
 *       400:
 *         description: Facture déjà émise, ne peut plus être supprimée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Facture introuvable
 */
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const facture = await deleteFactureBrouillon(id);
    if (!facture) {
      return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
