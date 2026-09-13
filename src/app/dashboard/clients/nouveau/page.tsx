import { Card, CardContent } from "@/components/ui/card";
import { ClientForm } from "../client-form";

export default function NouveauClientPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Nouveau client</h1>
      <Card>
        <CardContent className="pt-6">
          <ClientForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}
