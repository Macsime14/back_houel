import Link from "next/link";
import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { getDevis } from "@/services/devis.service";
import { listClients } from "@/services/client.service";
import { listPrestations } from "@/services/prestation.service";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { InfoField, InfoGrid } from "@/components/info-grid";
import { LigneTotals } from "@/components/ligne-totals";
import { LignesReadOnlyTable } from "@/components/lignes-table";
import { DevisForm } from "../devis-form";
import { DevisStatusBadge } from "../status-badge";
import { DevisActions } from "./devis-actions";

type Params = { params: Promise<{ id: string }> };

export default async function DevisDetailPage({ params }: Params) {
  const { id } = await params;
  const [devis, clients, prestations] = await Promise.all([
    getDevis(id),
    listClients(),
    listPrestations(),
  ]);

  if (!devis) {
    notFound();
  }

  const hasFacture = Boolean(devis.facture);
  const totalHT = devis.lignes.reduce(
    (sum, ligne) => sum + Number(ligne.quantite) * Number(ligne.prixUnitaireHT),
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-2xl font-semibold text-foreground">Devis n°{devis.numero}</h1>
          <DevisStatusBadge status={devis.status} />
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/api/devis/${devis.id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Download /> PDF
          </a>
          <DevisActions devisId={devis.id} status={devis.status} hasFacture={hasFacture} />
        </div>
      </div>

      {devis.client && (
        <Link
          href={`/dashboard/clients/${devis.client.id}`}
          className="text-sm text-primary hover:underline"
        >
          Voir la fiche client — {devis.client.nom}
        </Link>
      )}

      <Card>
        <CardContent className="pt-6">
          {hasFacture ? (
            <div className="space-y-4">
              <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                Ce devis a été transformé en facture, il n&apos;est plus modifiable.
              </p>
              <InfoGrid>
                <InfoField label="Client">{devis.clientNom}</InfoField>
                {devis.clientEmail && <InfoField label="Email">{devis.clientEmail}</InfoField>}
                {devis.clientTelephone && (
                  <InfoField label="Téléphone">{devis.clientTelephone}</InfoField>
                )}
                {devis.clientAdresse && <InfoField label="Adresse">{devis.clientAdresse}</InfoField>}
              </InfoGrid>
              <LignesReadOnlyTable
                lignes={devis.lignes.map((ligne) => ({
                  id: ligne.id,
                  description: ligne.description,
                  quantite: Number(ligne.quantite),
                  unite: ligne.unite,
                  prixUnitaireHT: Number(ligne.prixUnitaireHT),
                  tauxTVA: Number(ligne.tauxTVA),
                }))}
              />
              <LigneTotals totalHT={totalHT} totalTTC={Number(devis.totalTTC)} />
            </div>
          ) : (
            <DevisForm
              mode="edit"
              devisId={devis.id}
              clientOptions={clients}
              prestationOptions={prestations.map((p) => ({
                id: p.id,
                designation: p.designation,
                unite: p.unite,
                prixUnitaireHT: Number(p.prixUnitaireHT),
                tauxTVA: Number(p.tauxTVA),
              }))}
              initial={{
                clientId: devis.clientId,
                clientNom: devis.clientNom,
                clientEmail: devis.clientEmail,
                clientTelephone: devis.clientTelephone,
                clientAdresse: devis.clientAdresse,
                notes: devis.notes,
                lignes: devis.lignes.map((ligne) => ({
                  description: ligne.description,
                  quantite: Number(ligne.quantite),
                  unite: ligne.unite,
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
