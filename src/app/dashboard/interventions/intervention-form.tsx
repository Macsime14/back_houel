"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createInterventionAction, updateInterventionAction } from "./actions";

type DevisOption = { id: string; numero: number; clientNom: string };

type InterventionFormProps = {
  mode: "create" | "edit";
  interventionId?: string;
  devisOptions: DevisOption[];
  initial?: {
    titre: string;
    debut: string;
    fin: string;
    devisId?: string | null;
    notes?: string | null;
  };
};

function toLocalInputValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const NONE_VALUE = "none";

export function InterventionForm({
  mode,
  interventionId,
  devisOptions,
  initial,
}: InterventionFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [titre, setTitre] = useState(initial?.titre ?? "");
  const [debut, setDebut] = useState(initial ? toLocalInputValue(initial.debut) : "");
  const [fin, setFin] = useState(initial ? toLocalInputValue(initial.fin) : "");
  const [devisId, setDevisId] = useState(initial?.devisId ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const payload = {
      titre,
      debut,
      fin,
      devisId: devisId || undefined,
      notes: notes || undefined,
    };

    startTransition(async () => {
      if (mode === "create") {
        const result = await createInterventionAction(payload);
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        toast.success("Intervention créée");
        router.push(`/dashboard/interventions/${result.data.id}`);
        return;
      }

      const result = await updateInterventionAction(interventionId!, payload);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Intervention mise à jour");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="titre">Titre *</Label>
        <Input id="titre" value={titre} onChange={(e) => setTitre(e.target.value)} required />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="debut">Début *</Label>
          <Input
            id="debut"
            type="datetime-local"
            value={debut}
            onChange={(e) => setDebut(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fin">Fin *</Label>
          <Input
            id="fin"
            type="datetime-local"
            value={fin}
            onChange={(e) => setFin(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="devis">Devis lié (optionnel)</Label>
        <Select
          value={devisId || NONE_VALUE}
          onValueChange={(value) => setDevisId(!value || value === NONE_VALUE ? "" : value)}
        >
          <SelectTrigger id="devis" className="w-full">
            <SelectValue placeholder="Aucun">
              {(value: string | null) => {
                const option = devisOptions.find((d) => d.id === value);
                return option ? `Devis n°${option.numero} — ${option.clientNom}` : "Aucun";
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE_VALUE}>Aucun</SelectItem>
            {devisOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                Devis n°{option.numero} — {option.clientNom}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" value={notes ?? ""} onChange={(e) => setNotes(e.target.value)} rows={3} />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Enregistrement..." : mode === "create" ? "Créer l'intervention" : "Enregistrer"}
      </Button>
    </form>
  );
}
