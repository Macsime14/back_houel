"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createDevisAction, updateDevisAction } from "./actions";

type Ligne = {
  description: string;
  quantite: number;
  prixUnitaireHT: number;
  tauxTVA: number;
};

type DevisFormProps = {
  mode: "create" | "edit";
  devisId?: string;
  initial?: {
    clientNom: string;
    clientEmail?: string | null;
    clientTelephone?: string | null;
    clientAdresse?: string | null;
    notes?: string | null;
    lignes: Ligne[];
  };
};

const emptyLigne: Ligne = { description: "", quantite: 1, prixUnitaireHT: 0, tauxTVA: 20 };

export function DevisForm({ mode, devisId, initial }: DevisFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [clientNom, setClientNom] = useState(initial?.clientNom ?? "");
  const [clientEmail, setClientEmail] = useState(initial?.clientEmail ?? "");
  const [clientTelephone, setClientTelephone] = useState(initial?.clientTelephone ?? "");
  const [clientAdresse, setClientAdresse] = useState(initial?.clientAdresse ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
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

    const payload = {
      clientNom,
      clientEmail: clientEmail || undefined,
      clientTelephone: clientTelephone || undefined,
      clientAdresse: clientAdresse || undefined,
      notes: notes || undefined,
      lignes,
    };

    startTransition(async () => {
      if (mode === "create") {
        const result = await createDevisAction(payload);
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        toast.success("Devis créé");
        router.push(`/dashboard/devis/${result.data.id}`);
        return;
      }

      const result = await updateDevisAction(devisId!, payload);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Devis mis à jour");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="clientNom">Client *</Label>
          <Input
            id="clientNom"
            value={clientNom}
            onChange={(e) => setClientNom(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="clientEmail">Email</Label>
          <Input
            id="clientEmail"
            type="email"
            value={clientEmail ?? ""}
            onChange={(e) => setClientEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="clientTelephone">Téléphone</Label>
          <Input
            id="clientTelephone"
            value={clientTelephone ?? ""}
            onChange={(e) => setClientTelephone(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="clientAdresse">Adresse</Label>
          <Input
            id="clientAdresse"
            value={clientAdresse ?? ""}
            onChange={(e) => setClientAdresse(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes ?? ""}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Prestations *</Label>
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
                  size="sm"
                  onClick={() => removeLigne(index)}
                  disabled={lignes.length === 1}
                  aria-label="Supprimer la ligne"
                >
                  ✕
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
        Total HT : {totalHT.toFixed(2)} € — Total TTC : {totalTTC.toFixed(2)} €
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Enregistrement..." : mode === "create" ? "Créer le devis" : "Enregistrer"}
      </Button>
    </form>
  );
}
