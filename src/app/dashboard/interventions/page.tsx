import Link from "next/link";
import { CalendarClock, Plus } from "lucide-react";
import { listInterventions } from "@/services/intervention.service";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InterventionStatusBadge } from "./status-badge";
import { CalendarView } from "./calendar-view";

function formatPeriode(debut: Date, fin: Date) {
  const jour = debut.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const heureDebut = debut.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const heureFin = fin.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  return `${jour} · ${heureDebut} - ${heureFin}`;
}

export default async function PlanningPage() {
  const interventions = await listInterventions();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Planning</h1>
          <p className="text-sm text-muted-foreground">{interventions.length} intervention(s)</p>
        </div>
        <Link href="/dashboard/interventions/nouveau" className={buttonVariants()}>
          <Plus /> Nouvelle intervention
        </Link>
      </div>

      <Tabs defaultValue="calendrier">
        <TabsList>
          <TabsTrigger value="calendrier">Calendrier</TabsTrigger>
          <TabsTrigger value="liste">Liste</TabsTrigger>
        </TabsList>

        <TabsContent value="calendrier" className="mt-4">
          <CalendarView
            interventions={interventions.map((i) => ({
              id: i.id,
              titre: i.titre,
              debut: i.debut,
              fin: i.fin,
              status: i.status,
            }))}
          />
        </TabsContent>

        <TabsContent value="liste" className="mt-4">
          <div className="rounded-md border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Date / horaire</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Devis lié</TableHead>
                  <TableHead className="sr-only">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {interventions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <EmptyState
                        icon={CalendarClock}
                        title="Aucune intervention planifiée"
                        description="Ajoutez votre prochaine intervention au planning."
                        action={{ label: "Nouvelle intervention", href: "/dashboard/interventions/nouveau" }}
                      />
                    </TableCell>
                  </TableRow>
                )}
                {interventions.map((intervention) => (
                  <TableRow key={intervention.id}>
                    <TableCell>{intervention.titre}</TableCell>
                    <TableCell>{formatPeriode(intervention.debut, intervention.fin)}</TableCell>
                    <TableCell>
                      <InterventionStatusBadge status={intervention.status} />
                    </TableCell>
                    <TableCell>
                      {intervention.devis ? (
                        <Link
                          href={`/dashboard/devis/${intervention.devis.id}`}
                          className="text-primary hover:underline"
                        >
                          Devis n°{intervention.devis.numero}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
