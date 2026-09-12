"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "cn";
import type { Intervention } from "@/generated/prisma/client";

const STATUS_DOT: Record<Intervention["status"], string> = {
  PLANIFIEE: "bg-[#92702a]",
  CONFIRMEE: "bg-[#2f6690]",
  TERMINEE: "bg-[#34693f]",
  ANNULEE: "bg-[#99493a]",
};

const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function dateKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function startOfMonthGrid(year: number, month: number) {
  const firstOfMonth = new Date(year, month, 1);
  const isoWeekday = (firstOfMonth.getDay() + 6) % 7; // 0 = lundi
  const start = new Date(year, month, 1 - isoWeekday);
  const weeks: Date[][] = [];
  const cursor = new Date(start);
  while (weeks.length < 6) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

type CalendarViewProps = {
  interventions: Pick<Intervention, "id" | "titre" | "debut" | "fin" | "status">[];
};

export function CalendarView({ interventions }: CalendarViewProps) {
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const byDay = useMemo(() => {
    const map = new Map<string, typeof interventions>();
    for (const intervention of interventions) {
      const key = dateKey(new Date(intervention.debut));
      const list = map.get(key) ?? [];
      list.push(intervention);
      map.set(key, list);
    }
    return map;
  }, [interventions]);

  const weeks = useMemo(
    () => startOfMonthGrid(cursor.getFullYear(), cursor.getMonth()),
    [cursor],
  );

  const monthLabel = cursor.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  return (
    <div className="rounded-md border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="font-heading text-base font-semibold text-foreground capitalize">
          {monthLabel}
        </h2>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))}
          >
            Aujourd&apos;hui
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Mois précédent"
            onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))}
          >
            <ChevronLeft />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Mois suivant"
            onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-border text-xs font-medium text-muted-foreground">
        {JOURS.map((jour) => (
          <div key={jour} className="px-2 py-2 text-center">
            {jour}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {weeks.flat().map((day) => {
          const isCurrentMonth = day.getMonth() === cursor.getMonth();
          const isToday = dateKey(day) === dateKey(today);
          const dayInterventions = byDay.get(dateKey(day)) ?? [];
          const visible = dayInterventions.slice(0, 3);
          const overflow = dayInterventions.length - visible.length;

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "min-h-28 border-b border-r border-border px-1.5 py-1.5 last:border-r-0",
                !isCurrentMonth && "bg-muted/40",
              )}
            >
              <span
                className={cn(
                  "inline-flex size-6 items-center justify-center rounded-full font-mono text-xs",
                  isCurrentMonth ? "text-foreground" : "text-muted-foreground/60",
                  isToday && "bg-primary text-primary-foreground",
                )}
              >
                {day.getDate()}
              </span>

              <div className="mt-1 space-y-1">
                {visible.map((intervention) => (
                  <Link
                    key={intervention.id}
                    href={`/dashboard/interventions/${intervention.id}`}
                    className="flex items-center gap-1.5 rounded px-1 py-0.5 text-xs hover:bg-accent"
                  >
                    <span
                      className={cn("size-1.5 shrink-0 rounded-full", STATUS_DOT[intervention.status])}
                    />
                    <span className="shrink-0 font-mono text-muted-foreground">
                      {new Date(intervention.debut).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="truncate text-foreground">{intervention.titre}</span>
                  </Link>
                ))}
                {overflow > 0 && (
                  <span className="block px-1 text-xs text-muted-foreground">
                    +{overflow} autre{overflow > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
