import { Badge } from "@/components/ui/badge";
import type { InterventionStatus } from "@/generated/prisma/client";

const STATUS_CONFIG: Record<InterventionStatus, { label: string; className: string }> = {
  PLANIFIEE: { label: "Planifiée", className: "bg-slate-100 text-slate-700 hover:bg-slate-100" },
  CONFIRMEE: { label: "Confirmée", className: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
  TERMINEE: { label: "Terminée", className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" },
  ANNULEE: { label: "Annulée", className: "bg-red-100 text-red-800 hover:bg-red-100" },
};

export function InterventionStatusBadge({ status }: { status: InterventionStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
