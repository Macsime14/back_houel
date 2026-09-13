"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LigneTotals } from "@/components/ligne-totals";
import { createAvoirAction, updateAvoirBrouillonAction } from "./actions";

type Ligne = {
  description: string;
  quantite: number;
  unite: string;
  prixUnitaireHT: number;
  tauxTVA: number;
};

type AvoirFormProps = {
  mode: "create" | "edit";
  avoirId?: string;
  factureId?: string;
  initial?: {
    motif?: string | null;
    lignes: Ligne[];
  };
};

const emptyLigne: Ligne = { description: "", quantite: 1, unite: "unité", prixUnitaireHT: 0, tauxTVA: 20 };

export function AvoirForm({ mode, avoirId, factureId, initial }: AvoirFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [motif, setMotif] = useState(initial?.motif ?? "");
  const [lignes, setLignes] = useState<Ligne[]>(
    initial?.lignes?.length ? initial.lignes : [{ ...emptyLigne }],
  );

  function updateLigne(index: number, patch: Partial<Ligne>) {
    setLignes((prev) => prev.map((ligne, i) => (i === index ? { ...ligne, ...patch } : ligne)));
  }

  function addLigne() {
    setLignes((prev) => [...prev, { ...emptyLigne }]);
  }

  function removeLigne(index: number) {
    setLignes((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }

  const totalHT = lignes.reduce((sum, l) => sum + l.quantite * l.prixUnitaireHT, 0);
  const totalTTC = lignes.reduce(
    (sum, l) => sum + l.quantite * l.prixUnitaireHT * (1 + l.tauxTVA / 100),
    0,
  );

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const payload = { motif: motif || undefined, lignes };

    startTransition(async () => {
      if (mode === "create") {
        const result = await createAvoirAction({ factureId, ...payload });
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        toast.success("Avoir créé");
        router.push(`/dashboard/avoirs/${result.data.id}`);
        return;
      }

      const result = await updateAvoirBrouillonAction(avoirId!, payload);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Avoir mis à jour");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="motif">Motif</Label>
        <Textarea
          id="motif"
          value={motif ?? ""}
          onChange={(e) => setMotif(e.target.value)}
          rows={2}
          placeholder="Ex : erreur de facturation, geste commercial, annulation partielle..."
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Prestations créditées *</Label>
          <Button type="button" variant="outline" size="sm" onClick={addLigne}>
            + Ajouter une ligne
          </Button>
        </div>

        <div className="space-y-3">
          {lignes.map((ligne, index) => (
            <div
              key={index}
              className="grid grid-cols-12 items-end gap-2 rounded-md border border-border p-3"
            >
              <div className="col-span-12 space-y-1 sm:col-span-4">
                <Label className="text-xs text-muted-foreground">Description</Label>
                <Input
                  value={ligne.description}
                  onChange={(e) => updateLigne(index, { description: e.target.value })}
                  required
                />
              </div>
              <div className="col-span-6 space-y-1 sm:col-span-2">
                <Label className="text-xs text-muted-foreground">Qté</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={ligne.quantite}
                  onChange={(e) => updateLigne(index, { quantite: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="col-span-6 space-y-1 sm:col-span-2">
                <Label className="text-xs text-muted-foreground">Unité</Label>
                <Input
                  value={ligne.unite}
                  onChange={(e) => updateLigne(index, { unite: e.target.value })}
                  placeholder="unité, m², ml, h..."
                  required
                />
              </div>
              <div className="col-span-6 space-y-1 sm:col-span-2">
                <Label className="text-xs text-muted-foreground">PU HT</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={ligne.prixUnitaireHT}
                  onChange={(e) => updateLigne(index, { prixUnitaireHT: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="col-span-4 space-y-1 sm:col-span-1">
                <Label className="text-xs text-muted-foreground">TVA %</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.1"
                  value={ligne.tauxTVA}
                  onChange={(e) => updateLigne(index, { tauxTVA: Number(e.target.value) })}
                />
              </div>
              <div className="col-span-2 flex justify-end sm:col-span-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeLigne(index)}
                  disabled={lignes.length === 1}
                  aria-label="Supprimer la ligne"
                >
                  <X />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <LigneTotals totalHT={totalHT} totalTTC={totalTTC} />

      <Button type="submit" disabled={isPending}>
        {isPending ? "Enregistrement..." : mode === "create" ? "Créer l'avoir" : "Enregistrer"}
      </Button>
    </form>
  );
}
