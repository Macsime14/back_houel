import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { errorResponse } from "@/lib/api";
import { createDevisSchema } from "@/lib/validation";
import { createDevis, listDevis } from "@/services/devis.service";

export async function GET() {
  const devis = await listDevis();
  return NextResponse.json(devis);
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();
    const input = createDevisSchema.parse(body);
    const devis = await createDevis(input, session!.user.id);
    return NextResponse.json(devis, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
