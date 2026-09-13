"use server";

import { revalidatePath } from "next/cache";
import { createClientSchema, updateClientSchema } from "@/lib/validation";
import { createClient, deleteClient, updateClient } from "@/services/client.service";

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

export async function createClientAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = createClientSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const client = await createClient(parsed.data);
  revalidatePath("/dashboard/clients");
  return { success: true, data: { id: client.id } };
}

export async function updateClientAction(id: string, input: unknown): Promise<ActionResult<null>> {
  const parsed = updateClientSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  try {
    await updateClient(id, parsed.data);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erreur inattendue" };
  }

  revalidatePath("/dashboard/clients");
  revalidatePath(`/dashboard/clients/${id}`);
  return { success: true, data: null };
}

export async function deleteClientAction(id: string): Promise<ActionResult<null>> {
  try {
    await deleteClient(id);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erreur inattendue" };
  }

  revalidatePath("/dashboard/clients");
  return { success: true, data: null };
}
