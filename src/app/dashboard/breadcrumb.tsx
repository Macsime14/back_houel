"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "cn";

const SEGMENT_LABELS: Record<string, string> = {
  clients: "Clients",
  devis: "Devis",
  factures: "Factures",
  avoirs: "Avoirs",
  interventions: "Planning",
  prestations: "Prestations",
  parametres: "Paramètres",
  nouveau: "Nouveau",
};

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean).filter((s) => s !== "dashboard");

  const crumbs = [
    { href: "/dashboard", label: "Tableau de bord" },
    ...segments.map((segment, index) => ({
      href: "/dashboard/" + segments.slice(0, index + 1).join("/"),
      label: SEGMENT_LABELS[segment] ?? "Détail",
    })),
  ];

  return (
    <nav aria-label="Fil d'Ariane" className="flex min-w-0 items-center gap-1.5 text-sm">
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        return (
          <span
            key={crumb.href}
            className={cn(
              "flex min-w-0 items-center gap-1.5",
              !isLast && "hidden shrink-0 sm:flex",
            )}
          >
            {index > 0 && (
              <ChevronRight className="hidden size-3.5 shrink-0 text-muted-foreground sm:block" />
            )}
            {isLast ? (
              <span className="truncate font-medium text-foreground">{crumb.label}</span>
            ) : (
              <Link
                href={crumb.href}
                className={cn("truncate text-muted-foreground hover:text-foreground hover:underline")}
              >
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
