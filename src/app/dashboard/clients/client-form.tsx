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
import { createClientAction, updateClientAction } from "./actions";

type ClientType = "PARTICULIER" | "PROFESSIONNEL";

const TYPE_LABELS: Record<ClientType, string> = {
  PARTICULIER: "Particulier",
  PROFESSIONNEL: "Professionnel",
};

type CreatedClient = {
  id: string;
  nom: string;
  email: string | null;
  telephone: string | null;
  adresse: string | null;
  codePostal: string | null;
  ville: string | null;
};

type ClientFormProps = {
  mode: "create" | "edit";
  clientId?: string;
  initial?: {
    type?: ClientType;
    nom: string;
    email?: string | null;
    telephone?: string | null;
    adresse?: string | null;
    codePostal?: string | null;
    ville?: string | null;
    notes?: string | null;
  };
  /** En mode "create" : si fourni, remplace la redirection vers la fiche
   * client par cet appel (ex. creation rapide depuis un autre formulaire). */
  onCreated?: (client: CreatedClient) => void;
};

export function ClientForm({ mode, clientId, initial, onCreated }: ClientFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState<ClientType>(initial?.type ?? "PARTICULIER");
  const [nom, setNom] = useState(initial?.nom ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [telephone, setTelephone] = useState(initial?.telephone ?? "");
  const [adresse, setAdresse] = useState(initial?.adresse ?? "");
  const [codePostal, setCodePostal] = useState(initial?.codePostal ?? "");
  const [ville, setVille] = useState(initial?.ville ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const payload = {
      type,
      nom,
      email: email || undefined,
      telephone: telephone || undefined,
      adresse: adresse || undefined,
      codePostal: codePostal || undefined,
      ville: ville || undefined,
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
        if (onCreated) {
          onCreated(result.data);
        } else {
          router.push(`/dashboard/clients/${result.data.id}`);
        }
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
          <Label htmlFor="type">Type</Label>
          <Select value={type} onValueChange={(value) => setType(value as ClientType)}>
            <SelectTrigger id="type" className="w-full">
              <SelectValue>{(value: ClientType) => TYPE_LABELS[value]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PARTICULIER">Particulier</SelectItem>
              <SelectItem value="PROFESSIONNEL">Professionnel</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="adresse">Adresse</Label>
          <Input id="adresse" value={adresse ?? ""} onChange={(e) => setAdresse(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="codePostal">Code postal</Label>
          <Input
            id="codePostal"
            value={codePostal ?? ""}
            onChange={(e) => setCodePostal(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ville">Ville</Label>
          <Input id="ville" value={ville ?? ""} onChange={(e) => setVille(e.target.value)} />
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
