import { Badge } from "@/components/ui/badge";
import type { InterventionStatus } from "@/generated/prisma/client";

const STATUS_CONFIG: Record<InterventionStatus, { label: string; className: string }> = {
  PLANIFIEE: { label: "Planifiée", className: "bg-slate-500/15 text-slate-300 hover:bg-slate-500/15" },
  CONFIRMEE: { label: "Confirmée", className: "bg-blue-500/15 text-blue-400 hover:bg-blue-500/15" },
  TERMINEE: { label: "Terminée", className: "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/15" },
  ANNULEE: { label: "Annulée", className: "bg-red-500/15 text-red-400 hover:bg-red-500/15" },
};

export function InterventionStatusBadge({ status }: { status: InterventionStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
