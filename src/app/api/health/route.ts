import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/health:
 *   get:
 *     tags: [Système]
 *     summary: Vérifie que l'API répond (endpoint public, pas d'auth requise)
 *     security: []
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: ok }
 */
export function GET() {
  return NextResponse.json({ status: "ok" });
}
