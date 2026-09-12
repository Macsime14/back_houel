import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/api";
import { updateInterventionSchema } from "@/lib/validation";
import {
  deleteIntervention,
  getIntervention,
  updateIntervention,
} from "@/services/intervention.service";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const intervention = await getIntervention(id);
  if (!intervention) {
    return NextResponse.json({ error: "Intervention introuvable" }, { status: 404 });
  }
  return NextResponse.json(intervention);
}

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

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await deleteIntervention(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
