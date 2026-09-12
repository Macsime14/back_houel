import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResetPasswordForm } from "./reset-form";

type Params = { searchParams: Promise<{ token?: string }> };

export default async function ReinitialiserMotDePassePage({ searchParams }: Params) {
  const { token } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Nouveau mot de passe</CardTitle>
          <CardDescription>Choisissez un nouveau mot de passe pour votre compte.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {token ? (
            <ResetPasswordForm token={token} />
          ) : (
            <p className="text-sm text-destructive">
              Lien invalide : aucun jeton de réinitialisation fourni.
            </p>
          )}
          <Link href="/login" className="block text-center text-sm text-primary hover:underline">
            Retour à la connexion
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
