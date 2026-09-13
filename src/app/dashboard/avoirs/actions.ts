"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { createAvoirSchema, updateAvoirSchema } from "@/lib/validation";
import {
  createAvoir,
  deleteAvoirBrouillon,
  emettreAvoir,
  updateAvoirBrouillon,
} from "@/services/avoir.service";

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

export async function createAvoirAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Non authentifié" };
  }

  const parsed = createAvoirSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  try {
    const avoir = await createAvoir(parsed.data, session.user.id);
    revalidatePath("/dashboard/avoirs");
    revalidatePath(`/dashboard/factures/${parsed.data.factureId}`);
    return { success: true, data: { id: avoir.id } };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erreur inattendue" };
  }
}

export async function updateAvoirBrouillonAction(id: string, input: unknown): Promise<ActionResult<null>> {
  const parsed = updateAvoirSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  try {
    await updateAvoirBrouillon(id, parsed.data);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erreur inattendue" };
  }

  revalidatePath("/dashboard/avoirs");
  revalidatePath(`/dashboard/avoirs/${id}`);
  return { success: true, data: null };
}

export async function deleteAvoirAction(id: string): Promise<ActionResult<null>> {
  try {
    await deleteAvoirBrouillon(id);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erreur inattendue" };
  }

  revalidatePath("/dashboard/avoirs");
  return { success: true, data: null };
}

export async function emettreAvoirAction(id: string, mentionsLegales?: string): Promise<ActionResult<null>> {
  try {
    await emettreAvoir(id, mentionsLegales || undefined);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erreur inattendue" };
  }

  revalidatePath("/dashboard/avoirs");
  revalidatePath(`/dashboard/avoirs/${id}`);
  return { success: true, data: null };
}
