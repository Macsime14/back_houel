import Link from "next/link";
import { FileText, Receipt, CalendarClock, ArrowRight } from "lucide-react";
import { listDevis } from "@/services/devis.service";
import { listFactures } from "@/services/facture.service";
import { listInterventions } from "@/services/intervention.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function DashboardHomePage() {
  const [devis, factures, interventions] = await Promise.all([
    listDevis(),
    listFactures(),
    listInterventions(),
  ]);

  const devisEnAttente = devis.filter((d) => d.status === "ENVOYE").length;
  const devisAFacturer = devis.filter((d) => d.status === "ACCEPTE" && !d.facture).length;
  const facturesImpayees = factures.filter((f) => f.status === "EMISE").length;
  const prochainesInterventions = interventions
    .filter((i) => i.debut > new Date() && i.status !== "ANNULEE")
    .slice(0, 5);

  const stats = [
    {
      label: "Devis en attente de réponse",
      value: devisEnAttente,
      icon: FileText,
      href: "/dashboard/devis",
    },
    {
      label: "Devis acceptés à facturer",
      value: devisAFacturer,
      icon: FileText,
      href: "/dashboard/devis",
    },
    {
      label: "Factures émises non payées",
      value: facturesImpayees,
      icon: Receipt,
      href: "/dashboard/factures",
    },
    {
      label: "Interventions à venir",
      value: prochainesInterventions.length,
      icon: CalendarClock,
      href: "/dashboard/interventions",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Tableau de bord</h1>
        <p className="text-sm text-muted-foreground">Vue d&apos;ensemble de l&apos;activité</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="transition-colors hover:border-primary/40">
              <CardContent className="flex items-start justify-between pt-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-semibold text-foreground">{stat.value}</p>
                </div>
                <stat.icon className="size-5 text-primary" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Prochaines interventions</CardTitle>
          <Link
            href="/dashboard/interventions"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Voir le planning <ArrowRight className="size-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          {prochainesInterventions.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">Aucune intervention à venir.</p>
          ) : (
            <ul className="divide-y divide-border">
              {prochainesInterventions.map((intervention) => (
                <li key={intervention.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{intervention.titre}</p>
                    <p className="text-xs text-muted-foreground">
                      {intervention.debut.toLocaleDateString("fr-FR", {
                        weekday: "long",
                        day: "2-digit",
                        month: "long",
                      })}{" "}
                      ·{" "}
                      {intervention.debut.toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/interventions/${intervention.id}`}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  >
                    Voir
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
