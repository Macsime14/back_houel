import { Badge } from "@/components/ui/badge";
import type { InterventionStatus } from "@/generated/prisma/client";

const STATUS_CONFIG: Record<InterventionStatus, { label: string; className: string }> = {
  PLANIFIEE: { label: "Planifiée", className: "bg-[#f5ecd9] text-[#7a5a20] hover:bg-[#f5ecd9]" },
  CONFIRMEE: { label: "Confirmée", className: "bg-[#e2ecf3] text-[#2f6690] hover:bg-[#e2ecf3]" },
  TERMINEE: { label: "Terminée", className: "bg-[#e3f0e5] text-[#34693f] hover:bg-[#e3f0e5]" },
  ANNULEE: { label: "Annulée", className: "bg-[#f6e4e0] text-[#99493a] hover:bg-[#f6e4e0]" },
};

export function InterventionStatusBadge({ status }: { status: InterventionStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
