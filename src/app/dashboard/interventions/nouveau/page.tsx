import { Card, CardContent } from "@/components/ui/card";
import { listDevis } from "@/services/devis.service";
import { InterventionForm } from "../intervention-form";

export default async function NouvelleInterventionPage() {
  const devis = await listDevis();
  const devisOptions = devis
    .filter((d) => d.status === "ACCEPTE")
    .map((d) => ({ id: d.id, numero: d.numero, clientNom: d.clientNom }));

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Nouvelle intervention</h1>
      <Card>
        <CardContent className="pt-6">
          <InterventionForm mode="create" devisOptions={devisOptions} />
        </CardContent>
      </Card>
    </div>
  );
}
