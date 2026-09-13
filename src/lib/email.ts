import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
    to,
    subject: "Réinitialisation de votre mot de passe",
    html: `
      <p>Une réinitialisation de mot de passe a été demandée pour votre compte back_houel.</p>
      <p><a href="${resetUrl}">Cliquez ici pour choisir un nouveau mot de passe</a> (lien valable 1 heure).</p>
      <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
    `,
  });
}

export async function sendRelanceFactureEmail(
  to: string,
  info: { numero: number; totalTTC: string; dateEcheance: string; entrepriseNom: string },
) {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
    to,
    subject: `Rappel : facture n°${info.numero} en attente de paiement`,
    html: `
      <p>Bonjour,</p>
      <p>Sauf erreur de notre part, la facture n°${info.numero} d'un montant de ${info.totalTTC} €,
      dont l'échéance était fixée au ${info.dateEcheance}, ne nous est pas encore parvenue.</p>
      <p>Pourriez-vous nous indiquer où en est son règlement ? N'hésitez pas à nous contacter en cas
      de question.</p>
      <p>Cordialement,<br>${info.entrepriseNom}</p>
    `,
  });
}
