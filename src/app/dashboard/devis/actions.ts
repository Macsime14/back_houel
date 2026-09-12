"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { createDevisSchema, updateDevisSchema } from "@/lib/validation";
import { createDevis, deleteDevis, updateDevis } from "@/services/devis.service";

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

export async function createDevisAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Non authentifié" };
  }

  const parsed = createDevisSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const devis = await createDevis(parsed.data, session.user.id);
  revalidatePath("/dashboard/devis");
  return { success: true, data: { id: devis.id } };
}

export async function updateDevisAction(id: string, input: unknown): Promise<ActionResult<null>> {
  const parsed = updateDevisSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  try {
    await updateDevis(id, parsed.data);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erreur inattendue" };
  }

  revalidatePath("/dashboard/devis");
  revalidatePath(`/dashboard/devis/${id}`);
  return { success: true, data: null };
}

export async function deleteDevisAction(id: string): Promise<ActionResult<null>> {
  try {
    await deleteDevis(id);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erreur inattendue" };
  }

  revalidatePath("/dashboard/devis");
  return { success: true, data: null };
}
