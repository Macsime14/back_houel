import { Badge } from "@/components/ui/badge";
import type { FactureStatus } from "@/generated/prisma/client";

const STATUS_CONFIG: Record<FactureStatus, { label: string; className: string }> = {
  BROUILLON: { label: "Brouillon", className: "bg-slate-500/15 text-slate-300 hover:bg-slate-500/15" },
  EMISE: { label: "Émise", className: "bg-blue-500/15 text-blue-400 hover:bg-blue-500/15" },
  PAYEE: { label: "Payée", className: "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/15" },
  ANNULEE: { label: "Annulée", className: "bg-red-500/15 text-red-400 hover:bg-red-500/15" },
};

export function FactureStatusBadge({ status }: { status: FactureStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
