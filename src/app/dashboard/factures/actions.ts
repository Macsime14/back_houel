"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { ligneSchema } from "@/lib/validation";
import { z } from "zod";
import {
  createFactureFromDevis,
  deleteFactureBrouillon,
  emettreFacture,
  getFacture,
  marquerFacturePayee,
  relancerFacture,
  updateFactureBrouillon,
} from "@/services/facture.service";
import { getEntreprise } from "@/services/entreprise.service";
import { renderFacturePdf } from "@/lib/pdf/render";
import { sendFactureEmail } from "@/lib/email";

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

export async function emettreFactureAction(
  id: string,
  mentionsLegales?: string,
  dateEcheance?: string,
): Promise<ActionResult<null>> {
  try {
    await emettreFacture(id, mentionsLegales || undefined, dateEcheance ? new Date(dateEcheance) : undefined);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erreur inattendue" };
  }

  revalidatePath("/dashboard/factures");
  revalidatePath(`/dashboard/factures/${id}`);
  return { success: true, data: null };
}

export async function envoyerFactureParEmailAction(id: string): Promise<ActionResult<null>> {
  try {
    const facture = await getFacture(id);
    if (!facture) {
      return { success: false, error: "Facture introuvable" };
    }
    if (!facture.numero) {
      return { success: false, error: "Émettez d'abord la facture avant de l'envoyer" };
    }
    if (!facture.clientEmail) {
      return { success: false, error: "Ce client n'a pas d'adresse email enregistrée" };
    }

    const pdf = await renderFacturePdf(id);
    if (!pdf) {
      return { success: false, error: "Facture introuvable" };
    }

    const entreprise = await getEntreprise();
    await sendFactureEmail(
      facture.clientEmail,
      {
        numero: facture.numero,
        totalTTC: Number(facture.totalTTC).toFixed(2),
        dateEcheance: facture.dateEcheance?.toLocaleDateString("fr-FR"),
        entrepriseNom: entreprise.nom,
      },
      pdf,
    );
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erreur inattendue" };
  }

  revalidatePath(`/dashboard/factures/${id}`);
  return { success: true, data: null };
}

export async function relancerFactureAction(id: string): Promise<ActionResult<null>> {
  try {
    await relancerFacture(id);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erreur inattendue" };
  }

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
