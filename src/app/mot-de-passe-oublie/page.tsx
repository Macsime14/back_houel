"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requestPasswordResetAction } from "./actions";

export default function MotDePasseOubliePage() {
  const [result, formAction, isPending] = useActionState(requestPasswordResetAction, undefined);
  const success = result === "success";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Mot de passe oublié</CardTitle>
          <CardDescription>
            Indiquez votre email, un lien de réinitialisation vous sera envoyé s&apos;il correspond
            à un compte existant.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {success ? (
            <p className="text-sm text-muted-foreground">
              Si cet email correspond à un compte, un lien de réinitialisation vient d&apos;être
              envoyé. Vérifiez votre boîte de réception.
            </p>
          ) : (
            <form action={formAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required autoComplete="email" />
              </div>
              {result && <p className="text-sm text-destructive">{result}</p>}
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Envoi..." : "Envoyer le lien"}
              </Button>
            </form>
          )}
          <Link href="/login" className="block text-center text-sm text-primary hover:underline">
            Retour à la connexion
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
