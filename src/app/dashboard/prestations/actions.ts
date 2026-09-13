"use server";

import { revalidatePath } from "next/cache";
import { createPrestationSchema, updatePrestationSchema } from "@/lib/validation";
import { createPrestation, deletePrestation, updatePrestation } from "@/services/prestation.service";

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

export async function createPrestationAction(input: unknown): Promise<ActionResult<{
  id: string;
  designation: string;
  unite: string;
  prixUnitaireHT: number;
  tauxTVA: number;
}>> {
  const parsed = createPrestationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const prestation = await createPrestation(parsed.data);
  revalidatePath("/dashboard/prestations");
  return {
    success: true,
    data: {
      id: prestation.id,
      designation: prestation.designation,
      unite: prestation.unite,
      prixUnitaireHT: Number(prestation.prixUnitaireHT),
      tauxTVA: Number(prestation.tauxTVA),
    },
  };
}

export async function updatePrestationAction(id: string, input: unknown): Promise<ActionResult<null>> {
  const parsed = updatePrestationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  try {
    await updatePrestation(id, parsed.data);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erreur inattendue" };
  }

  revalidatePath("/dashboard/prestations");
  revalidatePath(`/dashboard/prestations/${id}`);
  return { success: true, data: null };
}

export async function deletePrestationAction(id: string): Promise<ActionResult<null>> {
  try {
    await deletePrestation(id);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erreur inattendue" };
  }

  revalidatePath("/dashboard/prestations");
  return { success: true, data: null };
}
