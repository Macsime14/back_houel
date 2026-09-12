import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { listDevis } from "@/services/devis.service";
import { listFactures } from "@/services/facture.service";
import { listInterventions } from "@/services/intervention.service";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DevisStatusBadge } from "./devis/status-badge";
import { FactureStatusBadge } from "./factures/status-badge";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="border-b border-border pb-2 text-sm font-medium text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

function EmptyLine({ children }: { children: React.ReactNode }) {
  return <p className="py-1 text-sm text-muted-foreground">{children}</p>;
}

export default async function DashboardHomePage() {
  const [devis, factures, interventions] = await Promise.all([
    listDevis(),
    listFactures(),
    listInterventions(),
  ]);

  const aTraiter = [
    {
      label: "Devis en attente de réponse",
      count: devis.filter((d) => d.status === "ENVOYE").length,
      href: "/dashboard/devis",
    },
    {
      label: "Devis acceptés à facturer",
      count: devis.filter((d) => d.status === "ACCEPTE" && !d.facture).length,
      href: "/dashboard/devis",
    },
    {
      label: "Factures émises non payées",
      count: factures.filter((f) => f.status === "EMISE").length,
      href: "/dashboard/factures",
    },
  ].filter((item) => item.count > 0);

  const now = new Date();
  const finDemain = new Date(now);
  finDemain.setDate(finDemain.getDate() + 2);
  finDemain.setHours(0, 0, 0, 0);
  const debutAujourdhui = new Date(now);
  debutAujourdhui.setHours(0, 0, 0, 0);

  const aujourdhuiEtDemain = interventions
    .filter(
      (i) => i.status !== "ANNULEE" && i.debut >= debutAujourdhui && i.debut < finDemain,
    )
    .sort((a, b) => a.debut.getTime() - b.debut.getTime());

  const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);
  const encaisseCeMois = factures
    .filter((f) => f.status === "PAYEE" && f.payeeAt && f.payeeAt >= debutMois)
    .reduce((sum, f) => sum + Number(f.totalTTC), 0);

  const devisRecents = devis.slice(0, 3);
  const facturesRecentes = factures.slice(0, 3);

  return (
    <div className="space-y-10 py-8">
      <h1 className="text-2xl font-semibold text-foreground">Tableau de bord</h1>

      <Section title="À traiter">
        {aTraiter.length === 0 ? (
          <EmptyLine>Rien en attente pour le moment.</EmptyLine>
        ) : (
          <ul>
            {aTraiter.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="flex items-center justify-between border-b border-border/60 py-2.5 text-sm text-foreground last:border-0 hover:text-primary"
                >
                  <span>{item.label}</span>
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span className="font-medium text-foreground">{item.count}</span>
                    <ChevronRight className="size-4" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Aujourd'hui et demain">
        {aujourdhuiEtDemain.length === 0 ? (
          <EmptyLine>Aucune intervention prévue aujourd&apos;hui ni demain.</EmptyLine>
        ) : (
          <ul>
            {aujourdhuiEtDemain.map((intervention) => (
              <li key={intervention.id}>
                <Link
                  href={`/dashboard/interventions/${intervention.id}`}
                  className="flex items-center justify-between border-b border-border/60 py-2.5 text-sm text-foreground last:border-0 hover:text-primary"
                >
                  <span>{intervention.titre}</span>
                  <span className="text-muted-foreground">
                    {intervention.debut.toLocaleDateString("fr-FR", {
                      weekday: "short",
                      day: "2-digit",
                      month: "short",
                    })}{" "}
                    ·{" "}
                    {intervention.debut.toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Ce mois">
        <p className="flex items-baseline gap-2 text-sm text-muted-foreground">
          Encaissé
          <span className="text-3xl font-semibold text-primary">
            {encaisseCeMois.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
          </span>
        </p>
      </Section>

      <Section title="Activité récente">
        <div className="grid gap-8 sm:grid-cols-2">
          <div className="space-y-1">
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-sm font-medium text-foreground">Devis</h3>
              <Link href="/dashboard/devis" className="text-xs text-primary hover:underline">
                tout voir
              </Link>
            </div>
            {devisRecents.length === 0 ? (
              <EmptyLine>Aucun devis pour l&apos;instant.</EmptyLine>
            ) : (
              <ul>
                {devisRecents.map((d) => (
                  <li key={d.id}>
                    <Link
                      href={`/dashboard/devis/${d.id}`}
                      className="flex items-center justify-between gap-3 border-b border-border/60 py-2.5 text-sm last:border-0 hover:text-primary"
                    >
                      <span className="flex items-center gap-2 overflow-hidden">
                        <span className="shrink-0 font-medium text-foreground">
                          D-{now.getFullYear()}-{String(d.numero).padStart(3, "0")}
                        </span>
                        <span className="truncate text-muted-foreground">{d.clientNom}</span>
                      </span>
                      <span className="flex shrink-0 items-center gap-3">
                        <span className="text-foreground">
                          {Number(d.totalTTC).toLocaleString("fr-FR", {
                            minimumFractionDigits: 2,
                          })}{" "}
                          €
                        </span>
                        <DevisStatusBadge status={d.status} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-sm font-medium text-foreground">Factures</h3>
              <Link href="/dashboard/factures" className="text-xs text-primary hover:underline">
                tout voir
              </Link>
            </div>
            {facturesRecentes.length === 0 ? (
              <EmptyLine>Aucune facture pour l&apos;instant.</EmptyLine>
            ) : (
              <ul>
                {facturesRecentes.map((f) => (
                  <li key={f.id}>
                    <Link
                      href={`/dashboard/factures/${f.id}`}
                      className="flex items-center justify-between gap-3 border-b border-border/60 py-2.5 text-sm last:border-0 hover:text-primary"
                    >
                      <span className="flex items-center gap-2 overflow-hidden">
                        <span className="shrink-0 font-medium text-foreground">
                          {f.numero ? `F-${now.getFullYear()}-${String(f.numero).padStart(3, "0")}` : "Brouillon"}
                        </span>
                        <span className="truncate text-muted-foreground">{f.clientNom}</span>
                      </span>
                      <span className="flex shrink-0 items-center gap-3">
                        <span className="text-foreground">
                          {Number(f.totalTTC).toLocaleString("fr-FR", {
                            minimumFractionDigits: 2,
                          })}{" "}
                          €
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
      </Section>

      <Section title="Raccourcis">
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
      </Section>
    </div>
  );
}
