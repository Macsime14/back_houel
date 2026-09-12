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
import type { InterventionStatus } from "@/generated/prisma/client";
import { deleteInterventionAction, updateInterventionAction } from "../actions";

type InterventionActionsProps = {
  interventionId: string;
  status: InterventionStatus;
};

export function InterventionActions({ interventionId, status }: InterventionActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function changeStatus(newStatus: InterventionStatus) {
    startTransition(async () => {
      const result = await updateInterventionAction(interventionId, { status: newStatus });
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
      const result = await deleteInterventionAction(interventionId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Intervention supprimée");
      router.push("/dashboard/interventions");
    });
  }

  return (
    <div className="flex items-center gap-2">
      {status === "PLANIFIEE" && (
        <Button size="sm" disabled={isPending} onClick={() => changeStatus("CONFIRMEE")}>
          Confirmer
        </Button>
      )}
      {(status === "PLANIFIEE" || status === "CONFIRMEE") && (
        <Button size="sm" variant="outline" disabled={isPending} onClick={() => changeStatus("TERMINEE")}>
          Marquer comme terminée
        </Button>
      )}
      {(status === "PLANIFIEE" || status === "CONFIRMEE") && (
        <Button size="sm" variant="outline" disabled={isPending} onClick={() => changeStatus("ANNULEE")}>
          Annuler
        </Button>
      )}
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
            <AlertDialogTitle>Supprimer cette intervention ?</AlertDialogTitle>
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
