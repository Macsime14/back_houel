import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/api";
import { updateDevisSchema } from "@/lib/validation";
import { deleteDevis, getDevis, updateDevis } from "@/services/devis.service";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const devis = await getDevis(id);
  if (!devis) {
    return NextResponse.json({ error: "Devis introuvable" }, { status: 404 });
  }
  return NextResponse.json(devis);
}

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
