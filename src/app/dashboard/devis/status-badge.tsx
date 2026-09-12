import { Badge } from "@/components/ui/badge";
import type { DevisStatus } from "@/generated/prisma/client";

const STATUS_CONFIG: Record<DevisStatus, { label: string; className: string }> = {
  BROUILLON: { label: "Brouillon", className: "bg-slate-500/15 text-slate-300 hover:bg-slate-500/15" },
  ENVOYE: { label: "Envoyé", className: "bg-blue-500/15 text-blue-400 hover:bg-blue-500/15" },
  ACCEPTE: { label: "Accepté", className: "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/15" },
  REFUSE: { label: "Refusé", className: "bg-red-500/15 text-red-400 hover:bg-red-500/15" },
};

export function DevisStatusBadge({ status }: { status: DevisStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
