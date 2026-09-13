import { Badge } from "@/components/ui/badge";
import type { AvoirStatus } from "@/generated/prisma/client";

const STATUS_CONFIG: Record<AvoirStatus, { label: string; className: string }> = {
  BROUILLON: { label: "Brouillon", className: "bg-[#f5ecd9] text-[#7a5a20] hover:bg-[#f5ecd9]" },
  EMISE: { label: "Émis", className: "bg-[#e2ecf3] text-[#2f6690] hover:bg-[#e2ecf3]" },
};

export function AvoirStatusBadge({ status }: { status: AvoirStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
