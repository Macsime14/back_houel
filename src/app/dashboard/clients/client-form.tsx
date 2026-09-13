"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClientAction, updateClientAction } from "./actions";

type ClientFormProps = {
  mode: "create" | "edit";
  clientId?: string;
  initial?: {
    nom: string;
    email?: string | null;
    telephone?: string | null;
    adresse?: string | null;
    notes?: string | null;
  };
};

export function ClientForm({ mode, clientId, initial }: ClientFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [nom, setNom] = useState(initial?.nom ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [telephone, setTelephone] = useState(initial?.telephone ?? "");
  const [adresse, setAdresse] = useState(initial?.adresse ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const payload = {
      nom,
      email: email || undefined,
      telephone: telephone || undefined,
      adresse: adresse || undefined,
      notes: notes || undefined,
    };

    startTransition(async () => {
      if (mode === "create") {
        const result = await createClientAction(payload);
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        toast.success("Client créé");
        router.push(`/dashboard/clients/${result.data.id}`);
        return;
      }

      const result = await updateClientAction(clientId!, payload);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Client mis à jour");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="nom">Nom *</Label>
          <Input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email ?? ""}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="telephone">Téléphone</Label>
          <Input
            id="telephone"
            value={telephone ?? ""}
            onChange={(e) => setTelephone(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="adresse">Adresse</Label>
          <Input id="adresse" value={adresse ?? ""} onChange={(e) => setAdresse(e.target.value)} />
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

      <Button type="submit" disabled={isPending}>
        {isPending ? "Enregistrement..." : mode === "create" ? "Créer le client" : "Enregistrer"}
      </Button>
    </form>
  );
}
