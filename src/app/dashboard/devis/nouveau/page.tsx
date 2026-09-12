import { Card, CardContent } from "@/components/ui/card";
import { DevisForm } from "../devis-form";

export default function NouveauDevisPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Nouveau devis</h1>
      <Card>
        <CardContent className="pt-6">
          <DevisForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}
