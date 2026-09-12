import Link from "next/link";
import { notFound } from "next/navigation";
import { getFacture } from "@/services/facture.service";
import { Card, CardContent } from "@/components/ui/card";
import { FactureStatusBadge } from "../status-badge";
import { FactureLignesForm } from "../facture-lignes-form";
import { FactureActions } from "./facture-actions";

type Params = { params: Promise<{ id: string }> };

export default async function FactureDetailPage({ params }: Params) {
  const { id } = await params;
  const facture = await getFacture(id);

  if (!facture) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-foreground">
            {facture.numero ? `Facture n°${facture.numero}` : "Facture (brouillon)"}
          </h1>
          <FactureStatusBadge status={facture.status} />
        </div>
        <FactureActions factureId={facture.id} status={facture.status} />
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Client</dt>
              <dd>{facture.clientNom}</dd>
            </div>
            {facture.clientEmail && (
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd>{facture.clientEmail}</dd>
              </div>
            )}
            <div>
              <dt className="text-muted-foreground">Devis d&apos;origine</dt>
              <dd>
                <Link href={`/dashboard/devis/${facture.devisId}`} className="text-primary hover:underline">
                  Voir le devis
                </Link>
              </dd>
            </div>
            {facture.emiseAt && (
              <div>
                <dt className="text-muted-foreground">Émise le</dt>
                <dd>{new Date(facture.emiseAt).toLocaleDateString("fr-FR")}</dd>
              </div>
            )}
            {facture.payeeAt && (
              <div>
                <dt className="text-muted-foreground">Payée le</dt>
                <dd>{new Date(facture.payeeAt).toLocaleDateString("fr-FR")}</dd>
              </div>
            )}
          </dl>

          {facture.mentionsLegales && (
            <p className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
              {facture.mentionsLegales}
            </p>
          )}

          {facture.verrouillee ? (
            <div className="space-y-2">
              <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                Cette facture a été émise, elle n&apos;est plus modifiable.
              </p>
              <ul className="divide-y divide-border text-sm">
                {facture.lignes.map((ligne) => (
                  <li key={ligne.id} className="flex justify-between py-2">
                    <span>
                      {ligne.description} × {ligne.quantite.toString()}
                    </span>
                    <span>{(Number(ligne.quantite) * Number(ligne.prixUnitaireHT)).toFixed(2)} € HT</span>
                  </li>
                ))}
              </ul>
              <p className="text-right text-sm font-medium text-foreground">
                Total TTC : {Number(facture.totalTTC).toFixed(2)} €
              </p>
            </div>
          ) : (
            <FactureLignesForm
              factureId={facture.id}
              initialLignes={facture.lignes.map((ligne) => ({
                description: ligne.description,
                quantite: Number(ligne.quantite),
                prixUnitaireHT: Number(ligne.prixUnitaireHT),
                tauxTVA: Number(ligne.tauxTVA),
              }))}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
