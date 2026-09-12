import { Badge } from "@/components/ui/badge";
import type { DevisStatus } from "@/generated/prisma/client";

const STATUS_CONFIG: Record<DevisStatus, { label: string; className: string }> = {
  BROUILLON: { label: "Brouillon", className: "bg-slate-100 text-slate-700 hover:bg-slate-100" },
  ENVOYE: { label: "Envoyé", className: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
  ACCEPTE: { label: "Accepté", className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" },
  REFUSE: { label: "Refusé", className: "bg-red-100 text-red-800 hover:bg-red-100" },
};

export function DevisStatusBadge({ status }: { status: DevisStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
