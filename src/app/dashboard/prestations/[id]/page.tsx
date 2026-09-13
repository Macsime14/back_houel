import { notFound } from "next/navigation";
import { getPrestation } from "@/services/prestation.service";
import { Card, CardContent } from "@/components/ui/card";
import { PrestationForm } from "../prestation-form";
import { PrestationActions } from "./prestation-actions";

type Params = { params: Promise<{ id: string }> };

export default async function PrestationDetailPage({ params }: Params) {
  const { id } = await params;
  const prestation = await getPrestation(id);

  if (!prestation) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          {prestation.designation}
        </h1>
        <PrestationActions prestationId={prestation.id} />
      </div>

      <Card>
        <CardContent className="pt-6">
          <PrestationForm
            mode="edit"
            prestationId={prestation.id}
            initial={{
              designation: prestation.designation,
              unite: prestation.unite,
              prixUnitaireHT: Number(prestation.prixUnitaireHT),
              tauxTVA: Number(prestation.tauxTVA),
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
