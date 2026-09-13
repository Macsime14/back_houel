"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Bell, CircleCheck, CreditCard, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DateField } from "@/components/ui/date-field";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { FactureStatus } from "@/generated/prisma/client";
import {
  deleteFactureAction,
  emettreFactureAction,
  marquerPayeeAction,
  relancerFactureAction,
} from "../actions";

type FactureActionsProps = {
  factureId: string;
  status: FactureStatus;
  mentionsLegalesSuggeree: string;
  dateEcheanceSuggeree: string;
  clientEmail: string | null;
  enRetard: boolean;
};

export function FactureActions({
  factureId,
  status,
  mentionsLegalesSuggeree,
  dateEcheanceSuggeree,
  clientEmail,
  enRetard,
}: FactureActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mentionsLegales, setMentionsLegales] = useState(mentionsLegalesSuggeree);
  const [dateEcheance, setDateEcheance] = useState(dateEcheanceSuggeree);

  function handleEmettre() {
    startTransition(async () => {
      const result = await emettreFactureAction(factureId, mentionsLegales, dateEcheance);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Facture émise et verrouillée");
      router.refresh();
    });
  }

  function handleMarquerPayee() {
    startTransition(async () => {
      const result = await marquerPayeeAction(factureId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Facture marquée comme payée");
      router.refresh();
    });
  }

  function handleRelancer() {
    startTransition(async () => {
      const result = await relancerFactureAction(factureId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Email de relance envoyé");
      router.refresh();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteFactureAction(factureId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Facture supprimée");
      router.push("/dashboard/factures");
    });
  }

  if (status === "BROUILLON") {
    return (
      <div className="flex items-center gap-2">
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button size="sm" disabled={isPending}>
                <CircleCheck /> Émettre la facture
              </Button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Émettre cette facture ?</AlertDialogTitle>
              <AlertDialogDescription>
                Action irréversible : un numéro légal définitif sera attribué et la facture sera
                verrouillée (plus aucune modification possible).
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2">
              <Label htmlFor="dateEcheance" className="text-xs text-muted-foreground">
                Échéance de paiement
              </Label>
              <DateField id="dateEcheance" value={dateEcheance} onChange={setDateEcheance} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mentionsLegales" className="text-xs text-muted-foreground">
                Mentions légales (optionnel)
              </Label>
              <Textarea
                id="mentionsLegales"
                value={mentionsLegales}
                onChange={(e) => setMentionsLegales(e.target.value)}
                rows={3}
                placeholder="SIRET, TVA, statut juridique..."
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleEmettre}>Confirmer l&apos;émission</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button size="sm" variant="destructive" disabled={isPending}>
                <Trash2 /> Supprimer
              </Button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer cette facture ?</AlertDialogTitle>
              <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Confirmer</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  if (status === "EMISE") {
    return (
      <div className="flex items-center gap-2">
        {enRetard && (
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button size="sm" variant="outline" disabled={isPending || !clientEmail}>
                  <Bell /> Relancer le client
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Relancer ce client ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Un email de rappel sera envoyé à {clientEmail} pour cette facture en retard de
                  paiement.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleRelancer}>Envoyer la relance</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        <Button size="sm" disabled={isPending} onClick={handleMarquerPayee}>
          <CreditCard /> Marquer comme payée
        </Button>
      </div>
    );
  }

  return null;
}
