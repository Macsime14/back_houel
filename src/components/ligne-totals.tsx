export function LigneTotals({ totalHT, totalTTC }: { totalHT: number; totalTTC: number }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-4 py-3">
      <span className="text-sm text-muted-foreground">
        Total HT :{" "}
        <span className="font-mono tabular-nums text-foreground">{totalHT.toFixed(2)} €</span>
      </span>
      <span className="text-base font-semibold text-foreground">
        Total TTC :{" "}
        <span className="font-mono tabular-nums">{totalTTC.toFixed(2)} €</span>
      </span>
    </div>
  );
}
