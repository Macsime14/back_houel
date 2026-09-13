import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#201d19",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  entrepriseNom: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  entrepriseLine: {
    fontSize: 9,
    color: "#6f6a60",
    marginBottom: 1,
  },
  titleBlock: {
    alignItems: "flex-end",
  },
  titleText: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#0f6e63",
    marginBottom: 4,
  },
  titleMeta: {
    fontSize: 9,
    color: "#6f6a60",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 24,
  },
  infoBlock: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 8,
    color: "#6f6a60",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 10,
    marginBottom: 2,
  },
  table: {
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1efe9",
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e6e2da",
  },
  colDescription: { flex: 3 },
  colQte: { flex: 1, textAlign: "right" },
  colPU: { flex: 1, textAlign: "right" },
  colTVA: { flex: 1, textAlign: "right" },
  colTotal: { flex: 1, textAlign: "right" },
  tableHeaderText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#6f6a60",
    textTransform: "uppercase",
  },
  totalsBlock: {
    marginTop: 16,
    alignItems: "flex-end",
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
    marginBottom: 4,
  },
  totalsLabel: {
    fontSize: 9,
    color: "#6f6a60",
  },
  totalsValue: {
    fontSize: 9,
  },
  totalsRowFinal: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#e6e2da",
  },
  totalsLabelFinal: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
  },
  totalsValueFinal: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
  },
  notesBlock: {
    marginTop: 24,
  },
  mentionsBlock: {
    marginTop: 32,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e6e2da",
  },
  mentionsText: {
    fontSize: 8,
    color: "#6f6a60",
  },
});

export type InvoiceDocumentProps = {
  documentTitle: string;
  numero: string;
  dateLabel: string;
  dateValue: string;
  dateEcheance?: string;
  entreprise: {
    nom: string;
    adresse?: string | null;
    siret?: string | null;
    numeroTVA?: string | null;
    telephone?: string | null;
    email?: string | null;
    iban?: string | null;
  };
  client: {
    nom: string;
    email?: string | null;
    telephone?: string | null;
    adresse?: string | null;
  };
  lignes: Array<{
    description: string;
    quantite: number;
    prixUnitaireHT: number;
    tauxTVA: number;
  }>;
  totalHT: number;
  totalTTC: number;
  notes?: string | null;
  mentionsLegales?: string | null;
};

function formatEuros(value: number) {
  return `${value.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

export function InvoiceDocument({
  documentTitle,
  numero,
  dateLabel,
  dateValue,
  dateEcheance,
  entreprise,
  client,
  lignes,
  totalHT,
  totalTTC,
  notes,
  mentionsLegales,
}: InvoiceDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.entrepriseNom}>{entreprise.nom}</Text>
            {entreprise.adresse && <Text style={styles.entrepriseLine}>{entreprise.adresse}</Text>}
            {entreprise.siret && (
              <Text style={styles.entrepriseLine}>SIRET {entreprise.siret}</Text>
            )}
            {entreprise.numeroTVA && (
              <Text style={styles.entrepriseLine}>TVA {entreprise.numeroTVA}</Text>
            )}
            {entreprise.telephone && (
              <Text style={styles.entrepriseLine}>{entreprise.telephone}</Text>
            )}
            {entreprise.email && <Text style={styles.entrepriseLine}>{entreprise.email}</Text>}
          </View>
          <View style={styles.titleBlock}>
            <Text style={styles.titleText}>{documentTitle}</Text>
            <Text style={styles.titleMeta}>N° {numero}</Text>
            <Text style={styles.titleMeta}>
              {dateLabel} {dateValue}
            </Text>
            {dateEcheance && <Text style={styles.titleMeta}>Échéance {dateEcheance}</Text>}
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Client</Text>
            <Text style={styles.infoValue}>{client.nom}</Text>
            {client.adresse && <Text style={styles.infoValue}>{client.adresse}</Text>}
            {client.email && <Text style={styles.infoValue}>{client.email}</Text>}
            {client.telephone && <Text style={styles.infoValue}>{client.telephone}</Text>}
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colDescription, styles.tableHeaderText]}>Description</Text>
            <Text style={[styles.colQte, styles.tableHeaderText]}>Qté</Text>
            <Text style={[styles.colPU, styles.tableHeaderText]}>PU HT</Text>
            <Text style={[styles.colTVA, styles.tableHeaderText]}>TVA</Text>
            <Text style={[styles.colTotal, styles.tableHeaderText]}>Total HT</Text>
          </View>
          {lignes.map((ligne, index) => (
            <View style={styles.tableRow} key={index}>
              <Text style={styles.colDescription}>{ligne.description}</Text>
              <Text style={styles.colQte}>{ligne.quantite}</Text>
              <Text style={styles.colPU}>{formatEuros(ligne.prixUnitaireHT)}</Text>
              <Text style={styles.colTVA}>{ligne.tauxTVA}%</Text>
              <Text style={styles.colTotal}>
                {formatEuros(ligne.quantite * ligne.prixUnitaireHT)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsBlock}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Total HT</Text>
            <Text style={styles.totalsValue}>{formatEuros(totalHT)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>TVA</Text>
            <Text style={styles.totalsValue}>{formatEuros(totalTTC - totalHT)}</Text>
          </View>
          <View style={styles.totalsRowFinal}>
            <Text style={styles.totalsLabelFinal}>Total TTC</Text>
            <Text style={styles.totalsValueFinal}>{formatEuros(totalTTC)}</Text>
          </View>
        </View>

        {notes && (
          <View style={styles.notesBlock}>
            <Text style={styles.infoLabel}>Notes</Text>
            <Text style={styles.infoValue}>{notes}</Text>
          </View>
        )}

        {entreprise.iban && (
          <View style={styles.notesBlock}>
            <Text style={styles.infoLabel}>Coordonnées bancaires</Text>
            <Text style={styles.infoValue}>{entreprise.iban}</Text>
          </View>
        )}

        {mentionsLegales && (
          <View style={styles.mentionsBlock}>
            <Text style={styles.mentionsText}>{mentionsLegales}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}
