import Link from "next/link";
import { Plus } from "lucide-react";
import { listDevis } from "@/services/devis.service";
import { listFactures } from "@/services/facture.service";
import { listInterventions } from "@/services/intervention.service";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DevisStatusBadge } from "./devis/status-badge";
import { FactureStatusBadge } from "./factures/status-badge";

export default async function DashboardHomePage() {
  const [devis, factures, interventions] = await Promise.all([
    listDevis(),
    listFactures(),
    listInterventions(),
  ]);

  const devisEnAttente = devis.filter((d) => d.status === "ENVOYE").length;
  const facturesImpayees = factures.filter((f) => f.status === "EMISE").length;

  const dansLes48h = new Date();
  dansLes48h.setDate(dansLes48h.getDate() + 2);
  const interventionsAVenir = interventions.filter(
    (i) => i.status !== "ANNULEE" && i.debut > new Date() && i.debut <= dansLes48h,
  ).length;

  const stats = [
    { label: "Devis en attente de réponse", value: devisEnAttente, href: "/dashboard/devis" },
    { label: "Facture(s) émise(s) non payée(s)", value: facturesImpayees, href: "/dashboard/factures" },
    { label: "Intervention(s) à venir", value: interventionsAVenir, href: "/dashboard/interventions" },
  ];

  const devisRecents = devis.slice(0, 3);
  const facturesRecentes = factures.slice(0, 3);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Tableau de bord</h1>
        <p className="text-sm text-muted-foreground">Vue d&apos;ensemble de l&apos;activité</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40">
              <span className="block font-mono text-2xl font-semibold text-primary">
                {stat.value}
              </span>
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h2 className="text-sm font-semibold text-foreground">Devis récents</h2>
            <Link href="/dashboard/devis" className="text-xs text-primary hover:underline">
              tout voir
            </Link>
          </div>
          {devisRecents.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">Aucun devis pour l&apos;instant.</p>
          ) : (
            <ul>
              {devisRecents.map((d) => (
                <li key={d.id}>
                  <Link
                    href={`/dashboard/devis/${d.id}`}
                    className="flex items-center justify-between gap-3 border-b border-border py-3 text-sm last:border-0 hover:text-primary"
                  >
                    <span className="flex items-center gap-2 overflow-hidden">
                      <span className="shrink-0 font-mono text-xs font-medium text-foreground">
                        Devis n°{d.numero}
                      </span>
                      <span className="truncate text-muted-foreground">{d.clientNom}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      <span className="font-mono text-foreground">
                        {Number(d.totalTTC).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
                      </span>
                      <DevisStatusBadge status={d.status} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h2 className="text-sm font-semibold text-foreground">Factures récentes</h2>
            <Link href="/dashboard/factures" className="text-xs text-primary hover:underline">
              tout voir
            </Link>
          </div>
          {facturesRecentes.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">Aucune facture pour l&apos;instant.</p>
          ) : (
            <ul>
              {facturesRecentes.map((f) => (
                <li key={f.id}>
                  <Link
                    href={`/dashboard/factures/${f.id}`}
                    className="flex items-center justify-between gap-3 border-b border-border py-3 text-sm last:border-0 hover:text-primary"
                  >
                    <span className="flex items-center gap-2 overflow-hidden">
                      <span className="shrink-0 font-mono text-xs font-medium text-foreground">
                        {f.numero ? `Facture n°${f.numero}` : "Brouillon"}
                      </span>
                      <span className="truncate text-muted-foreground">{f.clientNom}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      <span className="font-mono text-foreground">
                        {Number(f.totalTTC).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
                      </span>
                      <FactureStatusBadge status={f.status} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard/devis/nouveau" className={cn(buttonVariants())}>
          <Plus /> Nouveau devis
        </Link>
        <Link
          href="/dashboard/interventions/nouveau"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          <Plus /> Nouvelle intervention
        </Link>
      </div>
    </div>
  );
}
