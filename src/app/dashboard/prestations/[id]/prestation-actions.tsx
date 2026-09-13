"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
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
import { deletePrestationAction } from "../actions";

export function PrestationActions({ prestationId }: { prestationId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deletePrestationAction(prestationId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Prestation supprimée");
      router.push("/dashboard/prestations");
    });
  }

  return (
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
          <AlertDialogTitle>Supprimer cette prestation ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. Les devis et factures existants qui l&apos;utilisent ne
            sont pas modifiés, elle disparaît seulement du catalogue.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Confirmer</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
