import { notFound } from "next/navigation";
import { getDevis } from "@/services/devis.service";
import { Card, CardContent } from "@/components/ui/card";
import { DevisForm } from "../devis-form";
import { DevisStatusBadge } from "../status-badge";
import { DevisActions } from "./devis-actions";

type Params = { params: Promise<{ id: string }> };

export default async function DevisDetailPage({ params }: Params) {
  const { id } = await params;
  const devis = await getDevis(id);

  if (!devis) {
    notFound();
  }

  const hasFacture = Boolean(devis.facture);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-foreground">Devis n°{devis.numero}</h1>
          <DevisStatusBadge status={devis.status} />
        </div>
        <DevisActions devisId={devis.id} status={devis.status} hasFacture={hasFacture} />
      </div>

      <Card>
        <CardContent className="pt-6">
          {hasFacture ? (
            <div className="space-y-4">
              <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                Ce devis a été transformé en facture, il n&apos;est plus modifiable.
              </p>
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Client</dt>
                  <dd>{devis.clientNom}</dd>
                </div>
                {devis.clientEmail && (
                  <div>
                    <dt className="text-muted-foreground">Email</dt>
                    <dd>{devis.clientEmail}</dd>
                  </div>
                )}
                {devis.clientTelephone && (
                  <div>
                    <dt className="text-muted-foreground">Téléphone</dt>
                    <dd>{devis.clientTelephone}</dd>
                  </div>
                )}
                {devis.clientAdresse && (
                  <div>
                    <dt className="text-muted-foreground">Adresse</dt>
                    <dd>{devis.clientAdresse}</dd>
                  </div>
                )}
              </dl>
              <ul className="divide-y divide-border text-sm">
                {devis.lignes.map((ligne) => (
                  <li key={ligne.id} className="flex justify-between py-2">
                    <span>
                      {ligne.description} × {ligne.quantite.toString()}
                    </span>
                    <span>{(Number(ligne.quantite) * Number(ligne.prixUnitaireHT)).toFixed(2)} € HT</span>
                  </li>
                ))}
              </ul>
              <p className="text-right text-sm font-medium text-foreground">
                Total TTC : {Number(devis.totalTTC).toFixed(2)} €
              </p>
            </div>
          ) : (
            <DevisForm
              mode="edit"
              devisId={devis.id}
              initial={{
                clientNom: devis.clientNom,
                clientEmail: devis.clientEmail,
                clientTelephone: devis.clientTelephone,
                clientAdresse: devis.clientAdresse,
                notes: devis.notes,
                lignes: devis.lignes.map((ligne) => ({
                  description: ligne.description,
                  quantite: Number(ligne.quantite),
                  prixUnitaireHT: Number(ligne.prixUnitaireHT),
                  tauxTVA: Number(ligne.tauxTVA),
                })),
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
