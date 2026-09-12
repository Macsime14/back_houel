import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/api";
import { createInterventionSchema } from "@/lib/validation";
import { createIntervention, listInterventions } from "@/services/intervention.service";

export async function GET() {
  const interventions = await listInterventions();
  return NextResponse.json(interventions);
}

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
