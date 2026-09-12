"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { ligneSchema } from "@/lib/validation";
import { z } from "zod";
import {
  createFactureFromDevis,
  deleteFactureBrouillon,
  emettreFacture,
  marquerFacturePayee,
  updateFactureBrouillon,
} from "@/services/facture.service";

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

const lignesSchema = z.object({ lignes: z.array(ligneSchema).min(1).optional() });

export async function createFactureFromDevisAction(devisId: string): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Non authentifié" };
  }

  try {
    const facture = await createFactureFromDevis(devisId, session.user.id);
    revalidatePath("/dashboard/factures");
    revalidatePath(`/dashboard/devis/${devisId}`);
    return { success: true, data: { id: facture.id } };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erreur inattendue" };
  }
}

export async function updateFactureBrouillonAction(id: string, input: unknown): Promise<ActionResult<null>> {
  const parsed = lignesSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  try {
    await updateFactureBrouillon(id, parsed.data);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erreur inattendue" };
  }

  revalidatePath("/dashboard/factures");
  revalidatePath(`/dashboard/factures/${id}`);
  return { success: true, data: null };
}

export async function deleteFactureAction(id: string): Promise<ActionResult<null>> {
  try {
    await deleteFactureBrouillon(id);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erreur inattendue" };
  }

  revalidatePath("/dashboard/factures");
  return { success: true, data: null };
}

export async function emettreFactureAction(id: string, mentionsLegales?: string): Promise<ActionResult<null>> {
  try {
    await emettreFacture(id, mentionsLegales || undefined);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erreur inattendue" };
  }

  revalidatePath("/dashboard/factures");
  revalidatePath(`/dashboard/factures/${id}`);
  return { success: true, data: null };
}

export async function marquerPayeeAction(id: string): Promise<ActionResult<null>> {
  try {
    await marquerFacturePayee(id);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erreur inattendue" };
  }

  revalidatePath("/dashboard/factures");
  revalidatePath(`/dashboard/factures/${id}`);
  return { success: true, data: null };
}
