import { NextResponse } from "next/server";
import { listFactures } from "@/services/facture.service";

function csvEscape(value: string) {
  if (/[";\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * @swagger
 * /api/rapports/factures.csv:
 *   get:
 *     tags: [Rapports]
 *     summary: Exporte toutes les factures au format CSV (pour tableur/comptable)
 *     responses:
 *       200:
 *         description: Fichier CSV
 *         content:
 *           text/csv: {}
 */
export async function GET() {
  const factures = await listFactures();

  const header = [
    "Numero",
    "Statut",
    "Client",
    "Creee le",
    "Emise le",
    "Echeance",
    "Payee le",
    "Total HT",
    "Total TTC",
  ];

  const rows = factures.map((facture) => [
    facture.numero?.toString() ?? "",
    facture.status,
    facture.clientNom,
    facture.createdAt.toLocaleDateString("fr-FR"),
    facture.emiseAt?.toLocaleDateString("fr-FR") ?? "",
    facture.dateEcheance?.toLocaleDateString("fr-FR") ?? "",
    facture.payeeAt?.toLocaleDateString("fr-FR") ?? "",
    Number(facture.totalHT).toFixed(2),
    Number(facture.totalTTC).toFixed(2),
  ]);

  // Séparateur `;` (et non `,`) : c'est la virgule qui sert de séparateur
  // décimal en France, Excel FR n'importe donc correctement un CSV qu'avec
  // ce délimiteur. Le BOM UTF-8 en tête évite les accents mal interprétés.
  const csv = [header, ...rows].map((row) => row.map(csvEscape).join(";")).join("\r\n");

  return new NextResponse(`﻿${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="factures.csv"`,
    },
  });
}
