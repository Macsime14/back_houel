"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { consumePasswordResetToken } from "@/services/password-reset.service";

const schema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères."),
    confirmation: z.string(),
  })
  .refine((data) => data.password === data.confirmation, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmation"],
  });

export async function resetPasswordAction(_prevState: string | undefined, formData: FormData) {
  const parsed = schema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmation: formData.get("confirmation"),
  });

  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Données invalides.";
  }

  try {
    await consumePasswordResetToken(parsed.data.token, parsed.data.password);
  } catch (error) {
    return error instanceof Error ? error.message : "Erreur inattendue.";
  }

  redirect("/login?reset=success");
}
