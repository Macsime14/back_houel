"use server";

import { z } from "zod";
import { createPasswordResetToken } from "@/services/password-reset.service";
import { sendPasswordResetEmail } from "@/lib/email";

const emailSchema = z.string().email();

// Renvoie toujours le même message de succès, que l'email existe ou non,
// pour ne pas révéler quels emails sont enregistrés (anti-énumération).
export async function requestPasswordResetAction(
  _prevState: string | undefined,
  formData: FormData,
) {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) {
    return "Adresse email invalide.";
  }

  const result = await createPasswordResetToken(parsed.data);
  if (result) {
    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3001";
    const resetUrl = `${baseUrl}/reinitialiser-mot-de-passe?token=${result.token}`;
    await sendPasswordResetEmail(result.user.email, resetUrl);
  }

  return "success";
}
