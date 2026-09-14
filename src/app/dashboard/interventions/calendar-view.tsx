"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "cn";
import type { Intervention } from "@/generated/prisma/client";
import { InterventionStatusBadge } from "./status-badge";

const STATUS_DOT: Record<Intervention["status"], string> = {
  PLANIFIEE: "bg-[#7a5a20]",
  CONFIRMEE: "bg-[#2f6690]",
  TERMINEE: "bg-[#34693f]",
  ANNULEE: "bg-[#99493a]",
};

const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const JOURS_COURT = ["L", "M", "M", "J", "V", "S", "D"];

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
  const [selectedKey, setSelectedKey] = useState<string | null>(() => dateKey(today));

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

  const selectedInterventions = selectedKey ? (byDay.get(selectedKey) ?? []) : [];
  const selectedDate = weeks.flat().find((day) => dateKey(day) === selectedKey);

  return (
    <div className="rounded-md border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-3 py-3 sm:px-4">
        <h2 className="font-heading text-sm font-semibold text-foreground capitalize sm:text-base">
          {monthLabel}
        </h2>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setCursor(new Date(today.getFullYear(), today.getMonth(), 1));
              setSelectedKey(dateKey(today));
            }}
          >
            Aujourd&apos;hui
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Mois précédent"
            onClick={() =>
              setCursor((c) => {
                const next = new Date(c.getFullYear(), c.getMonth() - 1, 1);
                setSelectedKey(null);
                return next;
              })
            }
          >
            <ChevronLeft />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Mois suivant"
            onClick={() =>
              setCursor((c) => {
                const next = new Date(c.getFullYear(), c.getMonth() + 1, 1);
                setSelectedKey(null);
                return next;
              })
            }
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-border text-xs font-medium text-muted-foreground">
        {JOURS.map((jour, i) => (
          <div key={jour} className="px-2 py-2 text-center">
            <span className="sm:hidden">{JOURS_COURT[i]}</span>
            <span className="hidden sm:inline">{jour}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {weeks.flat().map((day) => {
          const isCurrentMonth = day.getMonth() === cursor.getMonth();
          const isToday = dateKey(day) === dateKey(today);
          const isSelected = dateKey(day) === selectedKey;
          const dayInterventions = byDay.get(dateKey(day)) ?? [];
          const visible = dayInterventions.slice(0, 3);
          const overflow = dayInterventions.length - visible.length;
          const dotsVisible = dayInterventions.slice(0, 4);

          return (
            <button
              type="button"
              key={day.toISOString()}
              onClick={() => setSelectedKey(dateKey(day))}
              className={cn(
                "min-h-16 overflow-hidden border-b border-r border-border px-1 py-1 text-left last:border-r-0 sm:min-h-28 sm:px-1.5 sm:py-1.5",
                !isCurrentMonth && "bg-muted/40",
                isSelected && "bg-accent",
              )}
            >
              <span
                className={cn(
                  "inline-flex size-5 items-center justify-center rounded-full font-mono text-[11px] sm:size-6 sm:text-xs",
                  isCurrentMonth ? "text-foreground" : "text-muted-foreground/60",
                  isToday && "bg-primary text-primary-foreground",
                )}
              >
                {day.getDate()}
              </span>

              {/* Détail heure + titre : assez de place uniquement à partir de sm */}
              <div className="mt-1 hidden space-y-1 sm:block">
                {visible.map((intervention) => (
                  <Link
                    key={intervention.id}
                    href={`/dashboard/interventions/${intervention.id}`}
                    className="flex min-w-0 items-center gap-1.5 rounded px-1 py-0.5 text-xs hover:bg-accent"
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
                    <span className="min-w-0 flex-1 truncate text-foreground">{intervention.titre}</span>
                  </Link>
                ))}
                {overflow > 0 && (
                  <span className="block px-1 text-xs text-muted-foreground">
                    +{overflow} autre{overflow > 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {/* Simples pastilles : pas assez de place pour le texte en dessous de sm */}
              {dotsVisible.length > 0 && (
                <div className="mt-1 flex flex-wrap items-center gap-0.5 sm:hidden">
                  {dotsVisible.map((intervention) => (
                    <span
                      key={intervention.id}
                      className={cn("size-1.5 rounded-full", STATUS_DOT[intervention.status])}
                    />
                  ))}
                  {dayInterventions.length > dotsVisible.length && (
                    <span className="text-[9px] text-muted-foreground">
                      +{dayInterventions.length - dotsVisible.length}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Agenda du jour sélectionné : seule vue lisible sur mobile pour le détail */}
      {selectedDate && (
        <div className="border-t border-border p-3 sm:hidden">
          <h3 className="mb-2 text-xs font-semibold text-muted-foreground">
            {selectedDate.toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </h3>
          {selectedInterventions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune intervention ce jour-là.</p>
          ) : (
            <ul className="space-y-2">
              {selectedInterventions.map((intervention) => (
                <li key={intervention.id}>
                  <Link
                    href={`/dashboard/interventions/${intervention.id}`}
                    className="flex items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2 hover:bg-accent"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn("size-1.5 shrink-0 rounded-full", STATUS_DOT[intervention.status])}
                        />
                        <span className="font-mono text-xs text-muted-foreground">
                          {new Date(intervention.debut).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="truncate text-sm font-medium text-foreground">{intervention.titre}</p>
                    </div>
                    <InterventionStatusBadge status={intervention.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
