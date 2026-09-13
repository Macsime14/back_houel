"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CircleCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { deleteAvoirAction, emettreAvoirAction } from "../actions";

type AvoirActionsProps = {
  avoirId: string;
  status: "BROUILLON" | "EMISE";
  mentionsLegalesSuggeree: string;
};

export function AvoirActions({ avoirId, status, mentionsLegalesSuggeree }: AvoirActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mentionsLegales, setMentionsLegales] = useState(mentionsLegalesSuggeree);

  function handleEmettre() {
    startTransition(async () => {
      const result = await emettreAvoirAction(avoirId, mentionsLegales);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Avoir émis et verrouillé");
      router.refresh();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteAvoirAction(avoirId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Avoir supprimé");
      router.push("/dashboard/avoirs");
    });
  }

  if (status !== "BROUILLON") {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <AlertDialog>
        <AlertDialogTrigger
          render={
            <Button size="sm" disabled={isPending}>
              <CircleCheck /> Émettre l&apos;avoir
            </Button>
          }
        />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Émettre cet avoir ?</AlertDialogTitle>
            <AlertDialogDescription>
              Action irréversible : un numéro légal définitif sera attribué et l&apos;avoir sera
              verrouillé (plus aucune modification possible).
            </AlertDialogDescription>
          </AlertDialogHeader>
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
            <AlertDialogTitle>Supprimer cet avoir ?</AlertDialogTitle>
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
