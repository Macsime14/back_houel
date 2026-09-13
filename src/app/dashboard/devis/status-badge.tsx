import { Badge } from "@/components/ui/badge";
import type { DevisStatus } from "@/generated/prisma/client";

const STATUS_CONFIG: Record<DevisStatus, { label: string; className: string }> = {
  BROUILLON: { label: "Brouillon", className: "bg-[#f5ecd9] text-[#7a5a20] hover:bg-[#f5ecd9]" },
  ENVOYE: { label: "Envoyé", className: "bg-[#e2ecf3] text-[#2f6690] hover:bg-[#e2ecf3]" },
  ACCEPTE: { label: "Accepté", className: "bg-[#e3f0e5] text-[#34693f] hover:bg-[#e3f0e5]" },
  REFUSE: { label: "Refusé", className: "bg-[#f6e4e0] text-[#99493a] hover:bg-[#f6e4e0]" },
};

export function DevisStatusBadge({ status }: { status: DevisStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
