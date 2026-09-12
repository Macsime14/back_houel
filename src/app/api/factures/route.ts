import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { errorResponse } from "@/lib/api";
import { z } from "zod";
import { createFactureFromDevis, listFactures } from "@/services/facture.service";

const createFactureSchema = z.object({ devisId: z.string().min(1) });

export async function GET() {
  const factures = await listFactures();
  return NextResponse.json(factures);
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();
    const { devisId } = createFactureSchema.parse(body);
    const facture = await createFactureFromDevis(devisId, session!.user.id);
    return NextResponse.json(facture, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
