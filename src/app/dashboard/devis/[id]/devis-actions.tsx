"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import type { DevisStatus } from "@/generated/prisma/client";
import { deleteDevisAction, updateDevisAction } from "../actions";
import { createFactureFromDevisAction } from "../../factures/actions";

type DevisActionsProps = {
  devisId: string;
  status: DevisStatus;
  hasFacture: boolean;
};

export function DevisActions({ devisId, status, hasFacture }: DevisActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function changeStatus(newStatus: DevisStatus) {
    startTransition(async () => {
      const result = await updateDevisAction(devisId, { status: newStatus });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Statut mis à jour");
      router.refresh();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteDevisAction(devisId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Devis supprimé");
      router.push("/dashboard/devis");
    });
  }

  function handleTransformerEnFacture() {
    startTransition(async () => {
      const result = await createFactureFromDevisAction(devisId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Facture créée");
      router.push(`/dashboard/factures/${result.data.id}`);
    });
  }

  return (
    <div className="flex items-center gap-2">
      {!hasFacture && status === "ACCEPTE" && (
        <Button size="sm" disabled={isPending} onClick={handleTransformerEnFacture}>
          Transformer en facture
        </Button>
      )}
      {!hasFacture && status === "BROUILLON" && (
        <Button size="sm" variant="outline" disabled={isPending} onClick={() => changeStatus("ENVOYE")}>
          Marquer comme envoyé
        </Button>
      )}
      {!hasFacture && status === "ENVOYE" && (
        <>
          <Button size="sm" disabled={isPending} onClick={() => changeStatus("ACCEPTE")}>
            Accepter
          </Button>
          <Button size="sm" variant="outline" disabled={isPending} onClick={() => changeStatus("REFUSE")}>
            Refuser
          </Button>
        </>
      )}
      {!hasFacture && (
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button size="sm" variant="destructive" disabled={isPending}>
                Supprimer
              </Button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer ce devis ?</AlertDialogTitle>
              <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Confirmer</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
