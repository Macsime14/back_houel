import Link from "next/link";
import { notFound } from "next/navigation";
import { getFacture } from "@/services/facture.service";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { AvoirForm } from "../avoir-form";

type SearchParams = { searchParams: Promise<{ factureId?: string }> };

export default async function NouvelAvoirPage({ searchParams }: SearchParams) {
  const { factureId } = await searchParams;

  if (!factureId) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-2xl font-semibold text-foreground">Nouvel avoir</h1>
        <p className="text-sm text-muted-foreground">
          Un avoir se crée depuis la fiche d&apos;une facture émise, pas directement ici.
        </p>
        <Link href="/dashboard/factures" className={buttonVariants({ variant: "outline" })}>
          Voir les factures
        </Link>
      </div>
    );
  }

  const facture = await getFacture(factureId);
  if (!facture || !facture.verrouillee) {
    notFound();
  }

  const dejaCredite = facture.avoirs
    .filter((a) => a.status === "EMISE")
    .reduce((sum, a) => sum + Number(a.totalTTC), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Nouvel avoir</h1>
        <p className="text-sm text-muted-foreground">
          Sur la{" "}
          <Link href={`/dashboard/factures/${facture.id}`} className="text-primary hover:underline">
            facture n°{facture.numero}
          </Link>{" "}
          — {facture.clientNom} — {Number(facture.totalTTC).toFixed(2)} € TTC
          {dejaCredite > 0 && ` (déjà crédité : ${dejaCredite.toFixed(2)} €)`}
        </p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <AvoirForm
            mode="create"
            factureId={facture.id}
            initial={{
              lignes: facture.lignes.map((ligne) => ({
                description: ligne.description,
                quantite: Number(ligne.quantite),
                unite: ligne.unite,
                prixUnitaireHT: Number(ligne.prixUnitaireHT),
                tauxTVA: Number(ligne.tauxTVA),
              })),
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
