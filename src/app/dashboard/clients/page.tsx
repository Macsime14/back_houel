import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { listClients } from "@/services/client.service";
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

export default async function ClientsListPage() {
  const clients = await listClients();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Clients</h1>
          <p className="text-sm text-muted-foreground">{clients.length} client(s)</p>
        </div>
        <Link href="/dashboard/clients/nouveau" className={buttonVariants()}>
          <Plus /> Nouveau client
        </Link>
      </div>

      <div className="rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead className="text-right">Devis</TableHead>
              <TableHead className="sr-only">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <EmptyState
                    icon={Users}
                    title="Aucun client pour l'instant"
                    description="Créez votre première fiche client."
                    action={{ label: "Nouveau client", href: "/dashboard/clients/nouveau" }}
                  />
                </TableCell>
              </TableRow>
            )}
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium text-foreground">{client.nom}</TableCell>
                <TableCell>{client.email ?? <span className="text-muted-foreground">—</span>}</TableCell>
                <TableCell>
                  {client.telephone ?? <span className="text-muted-foreground">—</span>}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {client._count.devis}
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/dashboard/clients/${client.id}`}
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
