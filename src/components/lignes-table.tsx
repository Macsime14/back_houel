import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Ligne = {
  id: string;
  description: string;
  quantite: number;
  unite: string;
  prixUnitaireHT: number;
  tauxTVA: number;
};

export function LignesReadOnlyTable({ lignes }: { lignes: Ligne[] }) {
  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Qté</TableHead>
            <TableHead className="text-right">PU HT</TableHead>
            <TableHead className="text-right">TVA</TableHead>
            <TableHead className="text-right">Total HT</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lignes.map((ligne) => (
            <TableRow key={ligne.id}>
              <TableCell>{ligne.description}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {ligne.quantite} {ligne.unite}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {ligne.prixUnitaireHT.toFixed(2)} €
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
                {ligne.tauxTVA}%
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums font-medium">
                {(ligne.quantite * ligne.prixUnitaireHT).toFixed(2)} €
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
