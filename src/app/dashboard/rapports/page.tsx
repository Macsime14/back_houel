import { Download } from "lucide-react";
import { getCAParMois, getStatsDevis, getTopClients } from "@/services/report.service";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatEuros(value: number) {
  return `${value.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

export default async function RapportsPage() {
  const [caParMois, topClients, statsDevis] = await Promise.all([
    getCAParMois(12),
    getTopClients(5),
    getStatsDevis(),
  ]);

  const totalAnnee = caParMois.reduce((sum, m) => sum + m.totalTTC, 0);
  const maxMois = Math.max(...caParMois.map((m) => m.totalTTC), 0);

  const dernierMois = caParMois[caParMois.length - 1];
  const moisPrecedent = caParMois[caParMois.length - 2];
  const variation =
    moisPrecedent && moisPrecedent.totalTTC > 0
      ? ((dernierMois.totalTTC - moisPrecedent.totalTTC) / moisPrecedent.totalTTC) * 100
      : null;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Rapports</h1>
          <p className="text-sm text-muted-foreground">Chiffre d&apos;affaires et suivi de l&apos;activité</p>
        </div>
        <a href="/api/rapports/factures.csv" className={buttonVariants({ variant: "outline", size: "sm" })}>
          <Download /> Exporter les factures (CSV)
        </a>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <span className="block font-mono text-2xl font-semibold text-primary">
            {formatEuros(totalAnnee)}
          </span>
          <span className="text-xs text-muted-foreground">Encaissé net — 12 derniers mois</span>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <span className="block font-mono text-2xl font-semibold text-primary">
            {formatEuros(dernierMois.totalTTC)}
          </span>
          <span className="text-xs text-muted-foreground">Encaissé net ce mois-ci</span>
          {variation !== null && (
            <span
              className={`mt-0.5 block text-xs font-medium ${variation >= 0 ? "text-[#34693f]" : "text-destructive"}`}
            >
              {variation >= 0 ? "▲" : "▼"} {Math.abs(variation).toFixed(0)}% vs mois précédent
            </span>
          )}
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <span className="block font-mono text-2xl font-semibold text-primary">
            {statsDevis.tauxAcceptation !== null ? `${statsDevis.tauxAcceptation.toFixed(0)}%` : "—"}
          </span>
          <span className="text-xs text-muted-foreground">
            Taux d&apos;acceptation des devis ({statsDevis.acceptes} accepté(s), {statsDevis.refuses} refusé(s),{" "}
            {statsDevis.enAttente} en attente)
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Chiffre d&apos;affaires encaissé par mois</h2>
        <div className="space-y-2 rounded-md border border-border bg-card p-4">
          {caParMois.map((mois) => (
            <div key={mois.key} className="flex items-center gap-3">
              <span className="w-14 shrink-0 text-xs text-muted-foreground capitalize">{mois.label}</span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${maxMois > 0 ? Math.max((mois.totalTTC / maxMois) * 100, mois.totalTTC !== 0 ? 2 : 0) : 0}%` }}
                />
              </div>
              <span className="w-24 shrink-0 text-right font-mono text-xs tabular-nums text-foreground">
                {formatEuros(mois.totalTTC)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Meilleurs clients (par encaissé)</h2>
        <div className="rounded-md border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead className="text-right">Total encaissé</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topClients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="py-8 text-center text-muted-foreground">
                    Aucune facture payée pour l&apos;instant.
                  </TableCell>
                </TableRow>
              )}
              {topClients.map((client) => (
                <TableRow key={client.clientNom}>
                  <TableCell className="font-medium text-foreground">{client.clientNom}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {formatEuros(client.totalTTC)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
