import { notFound } from "next/navigation";
import { getIntervention } from "@/services/intervention.service";
import { listDevis } from "@/services/devis.service";
import { Card, CardContent } from "@/components/ui/card";
import { InterventionForm } from "../intervention-form";
import { InterventionStatusBadge } from "../status-badge";
import { InterventionActions } from "./intervention-actions";

type Params = { params: Promise<{ id: string }> };

export default async function InterventionDetailPage({ params }: Params) {
  const { id } = await params;
  const [intervention, devis] = await Promise.all([getIntervention(id), listDevis()]);

  if (!intervention) {
    notFound();
  }

  // Le dropdown propose les devis acceptés, plus celui déjà lié le cas
  // échéant (ex: devis dont le statut a changé après coup) pour ne pas
  // perdre le lien existant.
  const devisOptions = devis
    .filter((d) => d.status === "ACCEPTE" || d.id === intervention.devisId)
    .map((d) => ({ id: d.id, numero: d.numero, clientNom: d.clientNom }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-foreground">{intervention.titre}</h1>
          <InterventionStatusBadge status={intervention.status} />
        </div>
        <InterventionActions interventionId={intervention.id} status={intervention.status} />
      </div>

      <Card>
        <CardContent className="pt-6">
          <InterventionForm
            mode="edit"
            interventionId={intervention.id}
            devisOptions={devisOptions}
            initial={{
              titre: intervention.titre,
              debut: intervention.debut.toISOString(),
              fin: intervention.fin.toISOString(),
              devisId: intervention.devisId,
              notes: intervention.notes,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
