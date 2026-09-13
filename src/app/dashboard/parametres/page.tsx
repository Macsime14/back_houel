import { getEntreprise } from "@/services/entreprise.service";
import { Card, CardContent } from "@/components/ui/card";
import { EntrepriseForm } from "./entreprise-form";
import { ChangePasswordForm } from "./change-password-form";

export default async function ParametresPage() {
  const entreprise = await getEntreprise();

  return (
    <div className="space-y-8">
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

      <div className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Sécurité</h2>
          <p className="text-sm text-muted-foreground">Changer votre mot de passe de connexion.</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <ChangePasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
