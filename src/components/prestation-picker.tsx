"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type PrestationOption = {
  id: string;
  designation: string;
  prixUnitaireHT: number;
  tauxTVA: number;
};

export function PrestationPicker({
  prestations,
  onSelect,
}: {
  prestations: PrestationOption[];
  onSelect: (prestation: PrestationOption) => void;
}) {
  const [value, setValue] = useState("");

  if (prestations.length === 0) return null;

  function handleChange(id: string | null) {
    if (!id) return;
    const prestation = prestations.find((p) => p.id === id);
    if (!prestation) return;
    onSelect(prestation);
    setValue("");
  }

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger size="sm">
        <BookOpen className="text-muted-foreground" />
        <SelectValue placeholder="Depuis le catalogue">{() => "Depuis le catalogue"}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {prestations.map((prestation) => (
          <SelectItem key={prestation.id} value={prestation.id}>
            {prestation.designation} — {prestation.prixUnitaireHT.toFixed(2)} € HT
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
