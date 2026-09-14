"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { createDevisSchema, updateDevisSchema } from "@/lib/validation";
import { createDevis, deleteDevis, getDevis, updateDevis } from "@/services/devis.service";
import { getEntreprise } from "@/services/entreprise.service";
import { renderDevisPdf } from "@/lib/pdf/render";
import { sendDevisEmail } from "@/lib/email";

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

export async function envoyerDevisParEmailAction(id: string): Promise<ActionResult<null>> {
  try {
    const devis = await getDevis(id);
    if (!devis) {
      return { success: false, error: "Devis introuvable" };
    }
    if (!devis.clientEmail) {
      return { success: false, error: "Ce client n'a pas d'adresse email enregistrée" };
    }

    const pdf = await renderDevisPdf(id);
    if (!pdf) {
      return { success: false, error: "Devis introuvable" };
    }

    const entreprise = await getEntreprise();
    await sendDevisEmail(
      devis.clientEmail,
      { numero: devis.numero, totalTTC: Number(devis.totalTTC).toFixed(2), entrepriseNom: entreprise.nom },
      pdf,
    );

    if (devis.status === "BROUILLON") {
      await updateDevis(id, { status: "ENVOYE" });
    }
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
