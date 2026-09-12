import { Badge } from "@/components/ui/badge";
import type { FactureStatus } from "@/generated/prisma/client";

const STATUS_CONFIG: Record<FactureStatus, { label: string; className: string }> = {
  BROUILLON: { label: "Brouillon", className: "bg-[#f5ecd9] text-[#92702a] hover:bg-[#f5ecd9]" },
  EMISE: { label: "Émise", className: "bg-[#e2ecf3] text-[#2f6690] hover:bg-[#e2ecf3]" },
  PAYEE: { label: "Payée", className: "bg-[#e3f0e5] text-[#34693f] hover:bg-[#e3f0e5]" },
  ANNULEE: { label: "Annulée", className: "bg-[#f6e4e0] text-[#99493a] hover:bg-[#f6e4e0]" },
};

export function FactureStatusBadge({ status }: { status: FactureStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
