"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "cn";

const SEGMENT_LABELS: Record<string, string> = {
  clients: "Clients",
  devis: "Devis",
  factures: "Factures",
  avoirs: "Avoirs",
  interventions: "Planning",
  prestations: "Prestations",
  rapports: "Rapports",
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
        const isFirst = index === 0;
        return (
          <span
            key={crumb.href}
            className={cn(
              "flex min-w-0 shrink-0 items-center gap-1.5",
              !isLast && !isFirst && "hidden sm:flex",
            )}
          >
            {index > 0 && <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />}
            {isLast ? (
              <span className="truncate font-medium text-foreground">{crumb.label}</span>
            ) : isFirst ? (
              <Link
                href={crumb.href}
                aria-label="Retour au tableau de bord"
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <Home className="size-4 shrink-0" />
                <span className="hidden truncate sm:inline">{crumb.label}</span>
              </Link>
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
