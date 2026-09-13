import Link from "next/link";
import { Plus, Wrench } from "lucide-react";
import { listPrestations } from "@/services/prestation.service";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function PrestationsListPage() {
  const prestations = await listPrestations();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Catalogue de prestations
          </h1>
          <p className="text-sm text-muted-foreground">
            {prestations.length} prestation(s) — pré-remplissent les lignes de devis et factures
          </p>
        </div>
        <Link href="/dashboard/prestations/nouveau" className={buttonVariants()}>
          <Plus /> Nouvelle prestation
        </Link>
      </div>

      <div className="rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Désignation</TableHead>
              <TableHead className="text-right">Prix unitaire HT</TableHead>
              <TableHead>Unité</TableHead>
              <TableHead className="text-right">TVA</TableHead>
              <TableHead className="sr-only">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prestations.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <EmptyState
                    icon={Wrench}
                    title="Aucune prestation dans le catalogue"
                    description="Ajoutez vos prestations habituelles pour accélérer la saisie des devis et factures."
                    action={{ label: "Nouvelle prestation", href: "/dashboard/prestations/nouveau" }}
                  />
                </TableCell>
              </TableRow>
            )}
            {prestations.map((prestation) => (
              <TableRow key={prestation.id}>
                <TableCell className="font-medium text-foreground">
                  {prestation.designation}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {Number(prestation.prixUnitaireHT).toFixed(2)} €
                </TableCell>
                <TableCell className="text-muted-foreground">{prestation.unite}</TableCell>
                <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
                  {Number(prestation.tauxTVA)}%
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/dashboard/prestations/${prestation.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    Modifier
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
