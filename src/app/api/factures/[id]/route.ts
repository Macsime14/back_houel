import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/api";
import { z } from "zod";
import { ligneSchema } from "@/lib/validation";
import { deleteFactureBrouillon, getFacture, updateFactureBrouillon } from "@/services/facture.service";

type Params = { params: Promise<{ id: string }> };

const updateFactureSchema = z.object({ lignes: z.array(ligneSchema).min(1).optional() });

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const facture = await getFacture(id);
  if (!facture) {
    return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
  }
  return NextResponse.json(facture);
}

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
