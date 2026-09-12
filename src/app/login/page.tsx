import { LoginForm } from "./login-form";

type Params = { searchParams: Promise<{ reset?: string }> };

export default async function LoginPage({ searchParams }: Params) {
  const { reset } = await searchParams;

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden flex-1 flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
        <span className="text-lg font-semibold">back_houel</span>
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold">Devis, factures et planning</h2>
          <p className="max-w-sm text-sm text-primary-foreground/80">
            Espace de gestion pour Antoine — suivi des devis, facturation et interventions.
          </p>
        </div>
        <span className="text-xs text-primary-foreground/60">back_houel — usage interne</span>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-1 lg:hidden">
            <p className="text-lg font-semibold text-foreground">back_houel</p>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-foreground">Connexion</h1>
            <p className="text-sm text-muted-foreground">Accès au dashboard back_houel</p>
          </div>

          <LoginForm resetSuccess={reset === "success"} />
        </div>
      </div>
    </div>
  );
}
