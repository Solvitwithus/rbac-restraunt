// components/ReceiptPDF.tsx
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

// Thermal printer config (80mm)
const CONFIG = {
  width: 226.77,
  padding: 12,
  fonts: {
    header: 14,
    title: 18,
    body: 11,
    small: 9,
  },
};

// Helper: Format currency
const formatCurrency = (amount: number): string => {
  return `KES ${amount.toFixed(2)}`;
};

// Helper: Truncate long text
const truncate = (text: string, max: number): string => {
  return text.length > max ? text.substring(0, max - 3) + "..." : text;
};

const styles = StyleSheet.create({
  page: {
    padding: CONFIG.padding,
    fontFamily: "Helvetica",
    fontSize: CONFIG.fonts.body,
    lineHeight: 1.3,
    backgroundColor: "#fff",
  },

  // Header
  header: {
    alignItems: "center",
    marginBottom: 10,
  },
  companyName: {
    fontSize: CONFIG.fonts.title,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  receiptType: {
    fontSize: CONFIG.fonts.header,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
  },
  contactInfo: {
    alignItems: "center",
    marginBottom: 8,
  },
  contactText: {
    fontSize: CONFIG.fonts.small,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
  },

  // Separators
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#999",
    borderStyle: "dashed",
    marginVertical: 10,
  },

  // Transaction Info
  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  infoColumn: {
    flex: 1,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  infoLabel: {
    fontSize: CONFIG.fonts.small,
    fontWeight: "bold",
  },
  infoValue: {
    fontSize: CONFIG.fonts.small,
    fontWeight: "bold",
    textAlign: "right",
  },

  // Items
  itemsSection: {
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: "row",
    marginBottom: 6,
    alignItems: "flex-start",
  },
  itemNumber: {
    width: 20,
    fontWeight: "bold",
  },
  itemDesc: {
    flex: 1,
    paddingRight: 8,
  },
  itemName: {
    fontWeight: "bold",
  },
  itemQtyPrice: {
    fontSize: CONFIG.fonts.small,
    marginTop: 2,
  },
  itemTotal: {
    width: 70,
    textAlign: "right",
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
  },

  // Totals
  totalsSection: {
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  totalLabel: {
    fontWeight: "bold",
  },
  totalValue: {
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#000",
    marginTop: 6,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  grandTotalValue: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
  },

  // Payment
  paymentSection: {
    marginVertical: 10,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  paymentLabel: {
    fontWeight: "bold",
  },
  paymentValue: {
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
  },

  // Footer
  footer: {
    alignItems: "center",
    marginTop: 20,
  },
  thankYou: {
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  footerText: {
    fontSize: CONFIG.fonts.small,
    textAlign: "center",
    fontWeight: "bold",
  },
});

interface ReceiptPDFProps {
  receiptDetails: {
    response: any;
    itemsSent: Array<{
      item_option: string;
      quantity: string;
      price: string;
      total: number;
    }>;
    totalAmount: number;
    invoiceNo: string;
  };
  cartTransaction: any;
  clientDetails: { name: string; kra: string };
  cashAmount: number;
  selectedMpesaTrans: any;
}

const ReceiptPDF: React.FC<ReceiptPDFProps> = ({
  receiptDetails,
  cartTransaction,
  clientDetails,
  cashAmount,
  selectedMpesaTrans,
}) => {
  const { response, itemsSent, totalAmount, invoiceNo } = receiptDetails;

  const date = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const time = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const customerName = clientDetails.name || "Walk-in Customer";

  return (
    <Document>
      <Page size={[CONFIG.width, 1400]} style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.companyName}>YOUR RESTAURANT</Text>
          <Text style={styles.receiptType}>CASH RECEIPT</Text>
          <View style={styles.contactInfo}>
            <Text style={styles.contactText}>Nairobi, Kenya</Text>
            <Text style={styles.contactText}>Phone: +254 700 000 000</Text>
            <Text style={styles.contactText}>TIN: P000123456A</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Transaction Info */}
        <View style={styles.infoGrid}>
          <View style={styles.infoColumn}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Invoice #:</Text>
              <Text style={styles.infoValue}>{invoiceNo}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date:</Text>
              <Text style={styles.infoValue}>{date}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Time:</Text>
              <Text style={styles.infoValue}>{time}</Text>
            </View>
          </View>

          <View style={styles.infoColumn}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Table:</Text>
              <Text style={styles.infoValue}>
                {cartTransaction?.displayLabel || "Counter"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Customer:</Text>
              <Text style={styles.infoValue}>{truncate(customerName, 20)}</Text>
            </View>
            {clientDetails.kra && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>KRA PIN:</Text>
                <Text style={styles.infoValue}>{clientDetails.kra}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Items */}
        <View style={styles.itemsSection}>
          {itemsSent.map((item, index) => {
            const qty = parseFloat(item.quantity);
            const price = parseFloat(item.price);
            const lineTotal = qty * price;

            return (
              <View key={index} style={styles.itemRow}>
                <Text style={styles.itemNumber}>{index + 1}</Text>
                <View style={styles.itemDesc}>
                  <Text style={styles.itemName}>
                    {truncate(item.item_option, 28)}
                  </Text>
                  <Text style={styles.itemQtyPrice}>
                    {qty.toFixed(0)} × KES {price.toFixed(2)}
                  </Text>
                </View>
                <Text style={styles.itemTotal}>
                  {formatCurrency(lineTotal)}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.divider} />

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(cartTransaction.subtotal)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>VAT</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(cartTransaction.tax)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tips/Service</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(cartTransaction.tips)}
            </Text>
          </View>

          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>GRAND TOTAL</Text>
            <Text style={styles.grandTotalValue}>
              {formatCurrency(totalAmount)}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Payments */}
        <View style={styles.paymentSection}>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Paid by Cash</Text>
            <Text style={styles.paymentValue}>
              {formatCurrency(cashAmount)}
            </Text>
          </View>

          {selectedMpesaTrans && (
            <>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Paid by M-Pesa</Text>
                <Text style={styles.paymentValue}>
                  {formatCurrency(parseFloat(selectedMpesaTrans.TransAmount))}
                </Text>
              </View>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>M-Pesa Ref</Text>
                <Text style={styles.paymentValue}>
                  {selectedMpesaTrans.TransID}
                </Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.divider} />

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.thankYou}>*** THANK YOU! ***</Text>
          <Text style={styles.footerText}>Come Again Soon</Text>
          <Text style={styles.footerText}>Powered by Your POS System</Text>
        </View>
      </Page>
    </Document>
  );
};

export default ReceiptPDF;