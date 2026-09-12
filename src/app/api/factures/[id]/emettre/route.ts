import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/api";
import { z } from "zod";
import { emettreFacture } from "@/services/facture.service";

type Params = { params: Promise<{ id: string }> };

const emettreSchema = z.object({ mentionsLegales: z.string().optional() });

// Action dédiée et irréversible : attribue le numéro légal et verrouille la
// facture. Séparée du PATCH générique pour que cette opération à fort enjeu
// légal ne puisse pas être déclenchée par erreur via une mise à jour normale.
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
