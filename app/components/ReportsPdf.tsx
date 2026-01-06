

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontSize: 10,
  },
  header: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    borderBottom: "1px solid #ddd",
    paddingVertical: 6,
  },
  cell: {
    flex: 1,
  },
  total: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default function ReportsPdf({ transactions }: { transactions: any[] }) {
  const total = transactions.reduce(
    (sum, tx) => sum + parseFloat(tx.ptotal || "0"),
    0
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Sales Report</Text>

        <View>
          {transactions.map((tx, i) => (
            <View key={i} style={styles.row}>
              <Text style={styles.cell}>{tx.invNo}</Text>
              <Text style={styles.cell}>{tx.customername}</Text>
              <Text style={styles.cell}>KES {tx.ptotal}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.total}>Total Revenue: KES {total.toFixed(2)}</Text>
      </Page>
    </Document>
  );
}
