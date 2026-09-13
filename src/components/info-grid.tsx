import type { ReactNode } from "react";

export function InfoGrid({ children }: { children: ReactNode }) {
  return (
    <dl className="grid gap-4 rounded-lg border border-border bg-muted/30 p-4 sm:grid-cols-2 lg:grid-cols-3">
      {children}
    </dl>
  );
}

export function InfoField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</dt>
      <dd className="text-sm text-foreground">{children}</dd>
    </div>
  );
}
