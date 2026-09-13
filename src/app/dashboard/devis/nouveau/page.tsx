import { Card, CardContent } from "@/components/ui/card";
import { listClients } from "@/services/client.service";
import { listPrestations } from "@/services/prestation.service";
import { DevisForm } from "../devis-form";

export default async function NouveauDevisPage() {
  const [clients, prestations] = await Promise.all([listClients(), listPrestations()]);

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Nouveau devis</h1>
      <Card>
        <CardContent className="pt-6">
          <DevisForm
            mode="create"
            clientOptions={clients}
            prestationOptions={prestations.map((p) => ({
              id: p.id,
              designation: p.designation,
              unite: p.unite,
              prixUnitaireHT: Number(p.prixUnitaireHT),
              tauxTVA: Number(p.tauxTVA),
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
