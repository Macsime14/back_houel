import Link from "next/link";
import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { factureEnRetard, getFacture } from "@/services/facture.service";
import { composerMentionsLegales, getEntreprise } from "@/services/entreprise.service";
import { listPrestations } from "@/services/prestation.service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { InfoField, InfoGrid } from "@/components/info-grid";
import { LigneTotals } from "@/components/ligne-totals";
import { LignesReadOnlyTable } from "@/components/lignes-table";
import { FactureStatusBadge } from "../status-badge";
import { FactureLignesForm } from "../facture-lignes-form";
import { FactureActions } from "./facture-actions";

type Params = { params: Promise<{ id: string }> };

export default async function FactureDetailPage({ params }: Params) {
  const { id } = await params;
  const [facture, entreprise, prestations] = await Promise.all([
    getFacture(id),
    getEntreprise(),
    listPrestations(),
  ]);

  if (!facture) {
    notFound();
  }

  const mentionsLegalesSuggeree = composerMentionsLegales(entreprise);
  const enRetard = factureEnRetard(facture);

  const totalHT = facture.lignes.reduce(
    (sum, ligne) => sum + Number(ligne.quantite) * Number(ligne.prixUnitaireHT),
    0,
  );

  const dateEcheanceSuggeree = new Date();
  dateEcheanceSuggeree.setDate(dateEcheanceSuggeree.getDate() + entreprise.delaiPaiementJours);
  const pad = (n: number) => String(n).padStart(2, "0");
  const dateEcheanceSuggereeStr = `${dateEcheanceSuggeree.getFullYear()}-${pad(dateEcheanceSuggeree.getMonth() + 1)}-${pad(dateEcheanceSuggeree.getDate())}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            {facture.numero ? `Facture n°${facture.numero}` : "Facture (brouillon)"}
          </h1>
          <FactureStatusBadge status={facture.status} />
          {enRetard && (
            <Badge variant="outline" className="bg-[#f6e4e0] text-[#99493a] hover:bg-[#f6e4e0]">
              En retard
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/api/factures/${facture.id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Download /> PDF
          </a>
          <FactureActions
            factureId={facture.id}
            status={facture.status}
            mentionsLegalesSuggeree={mentionsLegalesSuggeree}
            dateEcheanceSuggeree={dateEcheanceSuggereeStr}
            clientEmail={facture.clientEmail}
            enRetard={enRetard}
          />
        </div>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <InfoGrid>
            <InfoField label="Client">{facture.clientNom}</InfoField>
            {facture.clientEmail && <InfoField label="Email">{facture.clientEmail}</InfoField>}
            <InfoField label="Devis d'origine">
              <Link href={`/dashboard/devis/${facture.devisId}`} className="text-primary hover:underline">
                Voir le devis
              </Link>
            </InfoField>
            {facture.emiseAt && (
              <InfoField label="Émise le">
                {new Date(facture.emiseAt).toLocaleDateString("fr-FR")}
              </InfoField>
            )}
            {facture.dateEcheance && (
              <InfoField label="Échéance">
                <span className={enRetard ? "font-medium text-destructive" : undefined}>
                  {new Date(facture.dateEcheance).toLocaleDateString("fr-FR")}
                </span>
              </InfoField>
            )}
            {facture.payeeAt && (
              <InfoField label="Payée le">
                {new Date(facture.payeeAt).toLocaleDateString("fr-FR")}
              </InfoField>
            )}
            {facture.derniereRelanceAt && (
              <InfoField label="Dernière relance">
                {new Date(facture.derniereRelanceAt).toLocaleDateString("fr-FR")}
              </InfoField>
            )}
          </InfoGrid>

          {facture.mentionsLegales && (
            <p className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
              {facture.mentionsLegales}
            </p>
          )}

          {facture.verrouillee ? (
            <div className="space-y-4">
              <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                Cette facture a été émise, elle n&apos;est plus modifiable.
              </p>
              <LignesReadOnlyTable
                lignes={facture.lignes.map((ligne) => ({
                  id: ligne.id,
                  description: ligne.description,
                  quantite: Number(ligne.quantite),
                  prixUnitaireHT: Number(ligne.prixUnitaireHT),
                  tauxTVA: Number(ligne.tauxTVA),
                }))}
              />
              <LigneTotals totalHT={totalHT} totalTTC={Number(facture.totalTTC)} />
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
              prestationOptions={prestations.map((p) => ({
                id: p.id,
                designation: p.designation,
                prixUnitaireHT: Number(p.prixUnitaireHT),
                tauxTVA: Number(p.tauxTVA),
              }))}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
