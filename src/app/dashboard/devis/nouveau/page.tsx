import { Card, CardContent } from "@/components/ui/card";
import { listClients } from "@/services/client.service";
import { DevisForm } from "../devis-form";

export default async function NouveauDevisPage() {
  const clients = await listClients();

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Nouveau devis</h1>
      <Card>
        <CardContent className="pt-6">
          <DevisForm mode="create" clientOptions={clients} />
        </CardContent>
      </Card>
    </div>
  );
}
