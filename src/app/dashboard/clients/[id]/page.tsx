import Link from "next/link";
import { notFound } from "next/navigation";
import { getClient } from "@/services/client.service";
import { Card, CardContent } from "@/components/ui/card";
import { InfoField, InfoGrid } from "@/components/info-grid";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { CalendarClock, FileText } from "lucide-react";
import { DevisStatusBadge } from "../../devis/status-badge";
import { InterventionStatusBadge } from "../../interventions/status-badge";
import { ClientForm } from "../client-form";
import { ClientActions } from "./client-actions";

type Params = { params: Promise<{ id: string }> };

export default async function ClientDetailPage({ params }: Params) {
  const { id } = await params;
  const client = await getClient(id);

  if (!client) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-semibold text-foreground">{client.nom}</h1>
        <ClientActions clientId={client.id} />
      </div>

      <Card>
        <CardContent className="pt-6">
          <ClientForm
            mode="edit"
            clientId={client.id}
            initial={{
              nom: client.nom,
              email: client.email,
              telephone: client.telephone,
              adresse: client.adresse,
              notes: client.notes,
            }}
          />
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Devis & factures</h2>

        {client.devis.length === 0 ? (
          <div className="rounded-md border border-border bg-card">
            <EmptyState
              icon={FileText}
              title="Aucun devis pour ce client"
              description="Les devis créés pour ce client apparaîtront ici."
            />
          </div>
        ) : (
          <div className="rounded-md border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Devis</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Total TTC</TableHead>
                  <TableHead>Facture</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead className="sr-only">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {client.devis.map((devis) => (
                  <TableRow key={devis.id}>
                    <TableCell>Devis n°{devis.numero}</TableCell>
                    <TableCell>
                      <DevisStatusBadge status={devis.status} />
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {Number(devis.totalTTC).toFixed(2)} €
                    </TableCell>
                    <TableCell>
                      {devis.facture ? (
                        <Link
                          href={`/dashboard/factures/${devis.facture.id}`}
                          className="text-primary hover:underline"
                        >
                          {devis.facture.numero ? `Facture n°${devis.facture.numero}` : "Brouillon"}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>{new Date(devis.createdAt).toLocaleDateString("fr-FR")}</TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/dashboard/devis/${devis.id}`}
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
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Interventions</h2>

        {client.interventions.length === 0 ? (
          <div className="rounded-md border border-border bg-card">
            <EmptyState
              icon={CalendarClock}
              title="Aucune intervention pour ce client"
              description="Les interventions planifiées pour ce client apparaîtront ici."
            />
          </div>
        ) : (
          <div className="rounded-md border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="sr-only">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {client.interventions.map((intervention) => (
                  <TableRow key={intervention.id}>
                    <TableCell>{intervention.titre}</TableCell>
                    <TableCell>
                      {new Date(intervention.debut).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <InterventionStatusBadge status={intervention.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/dashboard/interventions/${intervention.id}`}
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
        )}
      </div>
    </div>
  );
}
