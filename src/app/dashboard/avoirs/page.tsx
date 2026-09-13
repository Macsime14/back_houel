import Link from "next/link";
import { Undo2 } from "lucide-react";
import { listAvoirs } from "@/services/avoir.service";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AvoirStatusBadge } from "./status-badge";

export default async function AvoirsListPage() {
  const avoirs = await listAvoirs();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Avoirs</h1>
        <p className="text-sm text-muted-foreground">
          {avoirs.length} avoir(s) — se créent depuis une facture émise
        </p>
      </div>

      <div className="rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N°</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Facture d&apos;origine</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Total TTC</TableHead>
              <TableHead className="sr-only">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {avoirs.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState
                    icon={Undo2}
                    title="Aucun avoir pour l'instant"
                    description="Un avoir se crée depuis la fiche d'une facture émise, pour la corriger ou l'annuler."
                  />
                </TableCell>
              </TableRow>
            )}
            {avoirs.map((avoir) => (
              <TableRow key={avoir.id}>
                <TableCell className="font-mono text-xs font-medium text-foreground">
                  {avoir.numero ?? "Brouillon"}
                </TableCell>
                <TableCell>{avoir.clientNom}</TableCell>
                <TableCell>
                  <Link
                    href={`/dashboard/factures/${avoir.factureId}`}
                    className="text-primary hover:underline"
                  >
                    {avoir.facture.numero ? `Facture n°${avoir.facture.numero}` : "Brouillon"}
                  </Link>
                </TableCell>
                <TableCell>
                  <AvoirStatusBadge status={avoir.status} />
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {Number(avoir.totalTTC).toFixed(2)} €
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/dashboard/avoirs/${avoir.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    Voir
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
