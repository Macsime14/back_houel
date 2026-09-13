"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { changePasswordSchema, updateEntrepriseSchema } from "@/lib/validation";
import { updateEntreprise } from "@/services/entreprise.service";
import { changePassword } from "@/services/user.service";

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

export async function changePasswordAction(input: unknown): Promise<ActionResult<null>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Non authentifié" };
  }

  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  try {
    await changePassword(session.user.id, parsed.data.currentPassword, parsed.data.newPassword);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erreur inattendue" };
  }

  return { success: true, data: null };
}
