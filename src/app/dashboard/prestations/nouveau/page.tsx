import { Card, CardContent } from "@/components/ui/card";
import { PrestationForm } from "../prestation-form";

export default function NouvellePrestationPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Nouvelle prestation</h1>
      <Card>
        <CardContent className="pt-6">
          <PrestationForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}
