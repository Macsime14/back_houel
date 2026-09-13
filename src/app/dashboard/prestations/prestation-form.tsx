"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPrestationAction, updatePrestationAction } from "./actions";

type PrestationFormProps = {
  mode: "create" | "edit";
  prestationId?: string;
  initial?: {
    designation: string;
    prixUnitaireHT: number;
    tauxTVA: number;
  };
};

export function PrestationForm({ mode, prestationId, initial }: PrestationFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [designation, setDesignation] = useState(initial?.designation ?? "");
  const [prixUnitaireHT, setPrixUnitaireHT] = useState(initial?.prixUnitaireHT ?? 0);
  const [tauxTVA, setTauxTVA] = useState(initial?.tauxTVA ?? 20);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const payload = { designation, prixUnitaireHT, tauxTVA };

    startTransition(async () => {
      if (mode === "create") {
        const result = await createPrestationAction(payload);
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        toast.success("Prestation créée");
        router.push("/dashboard/prestations");
        return;
      }

      const result = await updatePrestationAction(prestationId!, payload);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Prestation mise à jour");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="designation">Désignation *</Label>
        <Input
          id="designation"
          value={designation}
          onChange={(e) => setDesignation(e.target.value)}
          placeholder="Ex : Débouchage canalisation"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="prixUnitaireHT">Prix unitaire HT *</Label>
          <Input
            id="prixUnitaireHT"
            type="number"
            min={0}
            step="0.01"
            value={prixUnitaireHT}
            onChange={(e) => setPrixUnitaireHT(Number(e.target.value))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tauxTVA">TVA %</Label>
          <Input
            id="tauxTVA"
            type="number"
            min={0}
            step="0.1"
            value={tauxTVA}
            onChange={(e) => setTauxTVA(Number(e.target.value))}
          />
        </div>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Enregistrement..." : mode === "create" ? "Créer la prestation" : "Enregistrer"}
      </Button>
    </form>
  );
}
