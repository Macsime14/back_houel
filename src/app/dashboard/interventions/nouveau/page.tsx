import { Card, CardContent } from "@/components/ui/card";
import { listDevis } from "@/services/devis.service";
import { listClients } from "@/services/client.service";
import { InterventionForm } from "../intervention-form";

export default async function NouvelleInterventionPage() {
  const [devis, clients] = await Promise.all([listDevis(), listClients()]);
  const devisOptions = devis
    .filter((d) => d.status === "ACCEPTE")
    .map((d) => ({ id: d.id, numero: d.numero, clientNom: d.clientNom }));
  const clientOptions = clients.map((c) => ({ id: c.id, nom: c.nom }));

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Nouvelle intervention</h1>
      <Card>
        <CardContent className="pt-6">
          <InterventionForm mode="create" devisOptions={devisOptions} clientOptions={clientOptions} />
        </CardContent>
      </Card>
    </div>
  );
}
