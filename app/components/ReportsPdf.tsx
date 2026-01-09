"use client"
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
    fontWeight: "bold",
    color: "red", // ✅ FIXED
  },
  section: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottom: "1px solid #ccc",
  },
  row: {
    flexDirection: "row",
    marginBottom: 2,
  },
  label: {
    width: "30%",
    fontWeight: "bold",
  },
  value: {
    width: "70%",
  },
  tableHeader: {
    flexDirection: "row",
    marginTop: 6,
    borderBottom: "1px solid #000",
    paddingBottom: 4,
    fontWeight: "bold",
  },
  cellItem: { width: "40%" },
  cellQty: { width: "20%", textAlign: "right" },
  cellPrice: { width: "20%", textAlign: "right" },
  cellTotal: { width: "20%", textAlign: "right" },
  itemRow: {
    flexDirection: "row",
    paddingVertical: 2,
  },
  txTotal: {
    marginTop: 4,
    textAlign: "right",
    fontWeight: "bold",
  },
  grandTotal: {
    marginTop: 16,
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "right",
  },
});

export default function ReportsPdf({
  transactions,
}: {
  transactions: any[];
}) {
  const grandTotal = transactions.reduce(
    (sum, tx) => sum + parseFloat(tx.ptotal || "0"),
    0
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Sales Report</Text>

        {transactions.map((tx, index) => {
          const items = tx.pitems ? JSON.parse(tx.pitems) : [];
          const payments = tx.payments ? JSON.parse(tx.payments) : [];

          return (
            <View key={index} style={styles.section}>
              <View style={styles.row}>
                <Text style={styles.label}>Invoice No:</Text>
                <Text style={styles.value}>{tx.invNo}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Order No:</Text>
                <Text style={styles.value}>{tx.order_no}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Date:</Text>
                <Text style={styles.value}>{tx.pdate}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Customer:</Text>
                <Text style={styles.value}>{tx.customername}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Served By:</Text>
                <Text style={styles.value}>{tx.uname}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Payment:</Text>
                <Text style={styles.value}>
                  {payments.length > 0
                    ? payments.map((p: any) => p.Transtype).join(", ")
                    : tx.ptype}
                </Text>
              </View>

              <View style={styles.tableHeader}>
                <Text style={styles.cellItem}>Item</Text>
                <Text style={styles.cellQty}>Qty</Text>
                <Text style={styles.cellPrice}>Price</Text>
                <Text style={styles.cellTotal}>Total</Text>
              </View>

              {items.map((item: any, i: number) => (
                <View key={i} style={styles.itemRow}>
                  <Text style={styles.cellItem}>{item.item_option}</Text>
                  <Text style={styles.cellQty}>{item.quantity}</Text>
                  <Text style={styles.cellPrice}>KES {item.price}</Text>
                  <Text style={styles.cellTotal}>KES {item.total}</Text>
                </View>
              ))}

              <Text style={styles.txTotal}>
                Transaction Total: KES {parseFloat(tx.ptotal).toFixed(2)}
              </Text>
            </View>
          );
        })}

        <Text style={styles.grandTotal}>
          Grand Total Revenue: KES {grandTotal.toFixed(2)}
        </Text>
      </Page>
    </Document>
  );
}
