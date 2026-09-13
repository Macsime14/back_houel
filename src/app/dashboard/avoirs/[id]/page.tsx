import Link from "next/link";
import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { getAvoir } from "@/services/avoir.service";
import { composerMentionsLegales, getEntreprise } from "@/services/entreprise.service";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { InfoField, InfoGrid } from "@/components/info-grid";
import { LigneTotals } from "@/components/ligne-totals";
import { LignesReadOnlyTable } from "@/components/lignes-table";
import { AvoirStatusBadge } from "../status-badge";
import { AvoirForm } from "../avoir-form";
import { AvoirActions } from "./avoir-actions";

type Params = { params: Promise<{ id: string }> };

export default async function AvoirDetailPage({ params }: Params) {
  const { id } = await params;
  const [avoir, entreprise] = await Promise.all([getAvoir(id), getEntreprise()]);

  if (!avoir) {
    notFound();
  }

  const mentionsLegalesSuggeree = composerMentionsLegales(entreprise);
  const totalHT = avoir.lignes.reduce(
    (sum, ligne) => sum + Number(ligne.quantite) * Number(ligne.prixUnitaireHT),
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            {avoir.numero ? `Avoir n°${avoir.numero}` : "Avoir (brouillon)"}
          </h1>
          <AvoirStatusBadge status={avoir.status} />
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/api/avoirs/${avoir.id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Download /> PDF
          </a>
          <AvoirActions
            avoirId={avoir.id}
            status={avoir.status}
            mentionsLegalesSuggeree={mentionsLegalesSuggeree}
          />
        </div>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <InfoGrid>
            <InfoField label="Client">{avoir.clientNom}</InfoField>
            <InfoField label="Facture d'origine">
              <Link href={`/dashboard/factures/${avoir.factureId}`} className="text-primary hover:underline">
                {avoir.facture.numero ? `Facture n°${avoir.facture.numero}` : "Brouillon"}
              </Link>
            </InfoField>
            {avoir.motif && <InfoField label="Motif">{avoir.motif}</InfoField>}
            {avoir.emiseAt && (
              <InfoField label="Émis le">{new Date(avoir.emiseAt).toLocaleDateString("fr-FR")}</InfoField>
            )}
          </InfoGrid>

          {avoir.mentionsLegales && (
            <p className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
              {avoir.mentionsLegales}
            </p>
          )}

          {avoir.verrouillee ? (
            <div className="space-y-4">
              <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                Cet avoir a été émis, il n&apos;est plus modifiable.
              </p>
              <LignesReadOnlyTable
                lignes={avoir.lignes.map((ligne) => ({
                  id: ligne.id,
                  description: ligne.description,
                  quantite: Number(ligne.quantite),
                  unite: ligne.unite,
                  prixUnitaireHT: Number(ligne.prixUnitaireHT),
                  tauxTVA: Number(ligne.tauxTVA),
                }))}
              />
              <LigneTotals totalHT={totalHT} totalTTC={Number(avoir.totalTTC)} />
            </div>
          ) : (
            <AvoirForm
              mode="edit"
              avoirId={avoir.id}
              initial={{
                motif: avoir.motif,
                lignes: avoir.lignes.map((ligne) => ({
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
