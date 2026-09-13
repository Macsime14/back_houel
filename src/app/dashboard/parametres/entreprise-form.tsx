"use client";

import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateEntrepriseAction } from "./actions";

type EntrepriseFormProps = {
  initial: {
    nom: string;
    statutJuridique: string | null;
    siret: string | null;
    numeroTVA: string | null;
    adresse: string | null;
    telephone: string | null;
    email: string | null;
    iban: string | null;
    mentionsComplementaires: string | null;
    delaiPaiementJours: number;
  };
};

export function EntrepriseForm({ initial }: EntrepriseFormProps) {
  const [isPending, startTransition] = useTransition();
  const [nom, setNom] = useState(initial.nom);
  const [statutJuridique, setStatutJuridique] = useState(initial.statutJuridique ?? "");
  const [siret, setSiret] = useState(initial.siret ?? "");
  const [numeroTVA, setNumeroTVA] = useState(initial.numeroTVA ?? "");
  const [adresse, setAdresse] = useState(initial.adresse ?? "");
  const [telephone, setTelephone] = useState(initial.telephone ?? "");
  const [email, setEmail] = useState(initial.email ?? "");
  const [iban, setIban] = useState(initial.iban ?? "");
  const [mentionsComplementaires, setMentionsComplementaires] = useState(
    initial.mentionsComplementaires ?? "",
  );
  const [delaiPaiementJours, setDelaiPaiementJours] = useState(String(initial.delaiPaiementJours));

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const payload = {
      nom,
      statutJuridique: statutJuridique || undefined,
      siret: siret || undefined,
      numeroTVA: numeroTVA || undefined,
      adresse: adresse || undefined,
      telephone: telephone || undefined,
      email: email || undefined,
      iban: iban || undefined,
      mentionsComplementaires: mentionsComplementaires || undefined,
      delaiPaiementJours: delaiPaiementJours || undefined,
    };

    startTransition(async () => {
      const result = await updateEntrepriseAction(payload);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Coordonnées enregistrées");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="nom">Nom / raison sociale *</Label>
          <Input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="statutJuridique">Statut juridique</Label>
          <Input
            id="statutJuridique"
            value={statutJuridique}
            onChange={(e) => setStatutJuridique(e.target.value)}
            placeholder="Auto-entrepreneur, EURL, SARL..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="siret">SIRET</Label>
          <Input id="siret" value={siret} onChange={(e) => setSiret(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="numeroTVA">Numéro de TVA intracommunautaire</Label>
          <Input
            id="numeroTVA"
            value={numeroTVA}
            onChange={(e) => setNumeroTVA(e.target.value)}
            placeholder="Laisser vide si non applicable"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="adresse">Adresse</Label>
          <Input id="adresse" value={adresse} onChange={(e) => setAdresse(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="telephone">Téléphone</Label>
          <Input id="telephone" value={telephone} onChange={(e) => setTelephone(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="iban">IBAN (coordonnées bancaires)</Label>
          <Input id="iban" value={iban} onChange={(e) => setIban(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="delaiPaiementJours">Délai de paiement par défaut (jours)</Label>
          <Input
            id="delaiPaiementJours"
            type="number"
            min={1}
            value={delaiPaiementJours}
            onChange={(e) => setDelaiPaiementJours(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="mentionsComplementaires">Mentions légales complémentaires</Label>
        <Textarea
          id="mentionsComplementaires"
          value={mentionsComplementaires}
          onChange={(e) => setMentionsComplementaires(e.target.value)}
          rows={3}
          placeholder="Assurance décennale, RCS, capital social..."
        />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </form>
  );
}
