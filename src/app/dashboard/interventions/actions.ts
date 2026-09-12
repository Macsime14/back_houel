"use server";

import { revalidatePath } from "next/cache";
import { createInterventionSchema, updateInterventionSchema } from "@/lib/validation";
import {
  createIntervention,
  deleteIntervention,
  updateIntervention,
} from "@/services/intervention.service";

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

export async function createInterventionAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = createInterventionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  try {
    const intervention = await createIntervention(parsed.data);
    revalidatePath("/dashboard/interventions");
    return { success: true, data: { id: intervention.id } };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erreur inattendue" };
  }
}

export async function updateInterventionAction(id: string, input: unknown): Promise<ActionResult<null>> {
  const parsed = updateInterventionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  try {
    await updateIntervention(id, parsed.data);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erreur inattendue" };
  }

  revalidatePath("/dashboard/interventions");
  revalidatePath(`/dashboard/interventions/${id}`);
  return { success: true, data: null };
}

export async function deleteInterventionAction(id: string): Promise<ActionResult<null>> {
  try {
    await deleteIntervention(id);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erreur inattendue" };
  }

  revalidatePath("/dashboard/interventions");
  return { success: true, data: null };
}
