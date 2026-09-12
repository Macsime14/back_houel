import { Badge } from "@/components/ui/badge";
import type { FactureStatus } from "@/generated/prisma/client";

const STATUS_CONFIG: Record<FactureStatus, { label: string; className: string }> = {
  BROUILLON: { label: "Brouillon", className: "bg-slate-100 text-slate-700 hover:bg-slate-100" },
  EMISE: { label: "Émise", className: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
  PAYEE: { label: "Payée", className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" },
  ANNULEE: { label: "Annulée", className: "bg-red-100 text-red-800 hover:bg-red-100" },
};

export function FactureStatusBadge({ status }: { status: FactureStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
