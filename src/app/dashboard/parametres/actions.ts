"use server";

import { revalidatePath } from "next/cache";
import { updateEntrepriseSchema } from "@/lib/validation";
import { updateEntreprise } from "@/services/entreprise.service";

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

export async function updateEntrepriseAction(input: unknown): Promise<ActionResult<null>> {
  const parsed = updateEntrepriseSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  await updateEntreprise(parsed.data);
  revalidatePath("/dashboard/parametres");
  return { success: true, data: null };
}
