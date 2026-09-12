import Link from "next/link";
import { listFactures } from "@/services/facture.service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FactureStatusBadge } from "./status-badge";

export default async function FacturesListPage() {
  const factures = await listFactures();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Factures</h1>
        <p className="text-sm text-muted-foreground">{factures.length} facture(s)</p>
      </div>

      <div className="rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N°</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Total TTC</TableHead>
              <TableHead>Créée le</TableHead>
              <TableHead className="sr-only">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {factures.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  Aucune facture pour l&apos;instant. Elles se créent depuis un devis accepté.
                </TableCell>
              </TableRow>
            )}
            {factures.map((facture) => (
              <TableRow key={facture.id}>
                <TableCell>{facture.numero ?? "—"}</TableCell>
                <TableCell>{facture.clientNom}</TableCell>
                <TableCell>
                  <FactureStatusBadge status={facture.status} />
                </TableCell>
                <TableCell className="text-right">
                  {Number(facture.totalTTC).toFixed(2)} €
                </TableCell>
                <TableCell>{new Date(facture.createdAt).toLocaleDateString("fr-FR")}</TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/dashboard/factures/${facture.id}`}
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
