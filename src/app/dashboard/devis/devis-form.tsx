"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LigneTotals } from "@/components/ligne-totals";
import { PrestationPicker, type PrestationOption } from "@/components/prestation-picker";
import { ClientForm } from "../clients/client-form";
import { createDevisAction, updateDevisAction } from "./actions";

type Ligne = {
  description: string;
  quantite: number;
  unite: string;
  prixUnitaireHT: number;
  tauxTVA: number;
};

type ClientOption = {
  id: string;
  nom: string;
  email?: string | null;
  telephone?: string | null;
  adresse?: string | null;
  codePostal?: string | null;
  ville?: string | null;
};

function composeAdresse(client: ClientOption) {
  const ligne2 = [client.codePostal, client.ville].filter(Boolean).join(" ");
  return [client.adresse, ligne2].filter(Boolean).join(", ");
}

type DevisFormProps = {
  mode: "create" | "edit";
  devisId?: string;
  clientOptions?: ClientOption[];
  prestationOptions?: PrestationOption[];
  initial?: {
    clientId?: string | null;
    clientNom: string;
    clientEmail?: string | null;
    clientTelephone?: string | null;
    clientAdresse?: string | null;
    notes?: string | null;
    lignes: Ligne[];
  };
};

const emptyLigne: Ligne = { description: "", quantite: 1, unite: "unité", prixUnitaireHT: 0, tauxTVA: 20 };
const CLIENT_PONCTUEL = "ponctuel";

export function DevisForm({
  mode,
  devisId,
  clientOptions: initialClientOptions = [],
  prestationOptions = [],
  initial,
}: DevisFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [clientOptions, setClientOptions] = useState(initialClientOptions);
  const [newClientOpen, setNewClientOpen] = useState(false);

  const [clientId, setClientId] = useState(initial?.clientId ?? "");
  const [clientNom, setClientNom] = useState(initial?.clientNom ?? "");
  const [clientEmail, setClientEmail] = useState(initial?.clientEmail ?? "");
  const [clientTelephone, setClientTelephone] = useState(initial?.clientTelephone ?? "");
  const [clientAdresse, setClientAdresse] = useState(initial?.clientAdresse ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  function selectClient(client: ClientOption) {
    setClientId(client.id);
    setClientNom(client.nom);
    setClientEmail(client.email ?? "");
    setClientTelephone(client.telephone ?? "");
    setClientAdresse(composeAdresse(client));
  }

  function handleSelectClient(value: string | null) {
    if (!value || value === CLIENT_PONCTUEL) {
      setClientId("");
      return;
    }
    const client = clientOptions.find((c) => c.id === value);
    if (!client) return;
    selectClient(client);
  }

  function handleClientCreated(client: ClientOption) {
    setClientOptions((prev) => [...prev, client]);
    selectClient(client);
    setNewClientOpen(false);
  }
  const [lignes, setLignes] = useState<Ligne[]>(
    initial?.lignes?.length ? initial.lignes : [{ ...emptyLigne }],
  );

  function updateLigne(index: number, patch: Partial<Ligne>) {
    setLignes((prev) => prev.map((ligne, i) => (i === index ? { ...ligne, ...patch } : ligne)));
  }

  function addLigne() {
    setLignes((prev) => [...prev, { ...emptyLigne }]);
  }

  function addLigneFromPrestation(prestation: PrestationOption) {
    setLignes((prev) => [
      ...prev,
      {
        description: prestation.designation,
        quantite: 1,
        unite: prestation.unite,
        prixUnitaireHT: prestation.prixUnitaireHT,
        tauxTVA: prestation.tauxTVA,
      },
    ]);
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
      clientId: clientId || undefined,
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
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="clientExistant">Client existant</Label>
          <Dialog open={newClientOpen} onOpenChange={setNewClientOpen}>
            <DialogTrigger
              render={
                <Button type="button" variant="ghost" size="sm">
                  <Plus /> Nouveau client
                </Button>
              }
            />
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Nouveau client</DialogTitle>
              </DialogHeader>
              <ClientForm mode="create" onCreated={handleClientCreated} />
            </DialogContent>
          </Dialog>
        </div>
        <Select value={clientId || CLIENT_PONCTUEL} onValueChange={handleSelectClient}>
          <SelectTrigger id="clientExistant" className="w-full">
            <SelectValue placeholder="Client ponctuel">
              {(value: string) => {
                if (!value || value === CLIENT_PONCTUEL) return "Client ponctuel (saisie libre)";
                const client = clientOptions.find((c) => c.id === value);
                return client?.nom ?? "Client ponctuel (saisie libre)";
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={CLIENT_PONCTUEL}>Client ponctuel (saisie libre)</SelectItem>
            {clientOptions.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.nom}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
          <div className="flex items-center gap-2">
            <PrestationPicker prestations={prestationOptions} onSelect={addLigneFromPrestation} />
            <Button type="button" variant="outline" size="sm" onClick={addLigne}>
              + Ajouter une ligne
            </Button>
          </div>
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
        {isPending ? "Enregistrement..." : mode === "create" ? "Créer le devis" : "Enregistrer"}
      </Button>
    </form>
  );
}
