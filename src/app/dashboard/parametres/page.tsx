import { getEntreprise } from "@/services/entreprise.service";
import { Card, CardContent } from "@/components/ui/card";
import { EntrepriseForm } from "./entreprise-form";

export default async function ParametresPage() {
  const entreprise = await getEntreprise();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Paramètres</h1>
        <p className="text-sm text-muted-foreground">
          Coordonnées de l&apos;entreprise, utilisées pour pré-remplir les mentions légales des
          factures.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <EntrepriseForm
            initial={{
              nom: entreprise.nom,
              statutJuridique: entreprise.statutJuridique,
              siret: entreprise.siret,
              numeroTVA: entreprise.numeroTVA,
              adresse: entreprise.adresse,
              telephone: entreprise.telephone,
              email: entreprise.email,
              iban: entreprise.iban,
              mentionsComplementaires: entreprise.mentionsComplementaires,
              delaiPaiementJours: entreprise.delaiPaiementJours,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
