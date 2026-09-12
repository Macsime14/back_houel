import Link from "next/link";
import { Plus } from "lucide-react";
import { listDevis } from "@/services/devis.service";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DevisStatusBadge } from "./status-badge";

export default async function DevisListPage() {
  const devis = await listDevis();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Devis</h1>
          <p className="text-sm text-muted-foreground">{devis.length} devis</p>
        </div>
        <Link href="/dashboard/devis/nouveau" className={buttonVariants()}>
          <Plus /> Nouveau devis
        </Link>
      </div>

      <div className="rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N°</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Total TTC</TableHead>
              <TableHead>Créé le</TableHead>
              <TableHead className="sr-only">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {devis.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  Aucun devis pour l&apos;instant.
                </TableCell>
              </TableRow>
            )}
            {devis.map((d) => (
              <TableRow key={d.id}>
                <TableCell>{d.numero}</TableCell>
                <TableCell>{d.clientNom}</TableCell>
                <TableCell>
                  <DevisStatusBadge status={d.status} />
                </TableCell>
                <TableCell className="text-right">{Number(d.totalTTC).toFixed(2)} €</TableCell>
                <TableCell>{new Date(d.createdAt).toLocaleDateString("fr-FR")}</TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/dashboard/devis/${d.id}`}
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
