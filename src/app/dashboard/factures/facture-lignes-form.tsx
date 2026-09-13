"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LigneTotals } from "@/components/ligne-totals";
import { updateFactureBrouillonAction } from "./actions";

type Ligne = {
  description: string;
  quantite: number;
  prixUnitaireHT: number;
  tauxTVA: number;
};

export function FactureLignesForm({ factureId, initialLignes }: { factureId: string; initialLignes: Ligne[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [lignes, setLignes] = useState<Ligne[]>(initialLignes);

  function updateLigne(index: number, patch: Partial<Ligne>) {
    setLignes((prev) => prev.map((ligne, i) => (i === index ? { ...ligne, ...patch } : ligne)));
  }

  function addLigne() {
    setLignes((prev) => [...prev, { description: "", quantite: 1, prixUnitaireHT: 0, tauxTVA: 20 }]);
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

    startTransition(async () => {
      const result = await updateFactureBrouillonAction(factureId, { lignes });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Facture mise à jour");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Prestations</Label>
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
            <div className="col-span-12 space-y-1 sm:col-span-5">
              <Label className="text-xs text-muted-foreground">Description</Label>
              <Input
                value={ligne.description}
                onChange={(e) => updateLigne(index, { description: e.target.value })}
                required
              />
            </div>
            <div className="col-span-4 space-y-1 sm:col-span-2">
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
            <div className="col-span-4 space-y-1 sm:col-span-2">
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
            <div className="col-span-3 space-y-1 sm:col-span-2">
              <Label className="text-xs text-muted-foreground">TVA %</Label>
              <Input
                type="number"
                min={0}
                step="0.1"
                value={ligne.tauxTVA}
                onChange={(e) => updateLigne(index, { tauxTVA: Number(e.target.value) })}
              />
            </div>
            <div className="col-span-1 flex justify-end">
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

      <LigneTotals totalHT={totalHT} totalTTC={totalTTC} />

      <Button type="submit" disabled={isPending}>
        {isPending ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </form>
  );
}
