"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { FileDown } from "lucide-react";
import ReportsPdf from "./ReportsPdf";

export default function ReportPdfButton({
  transactions,
  startDate,
  endDate,
}: {
  transactions: any[];
  startDate: string;
  endDate: string;
}) {
  return (
    <PDFDownloadLink
      document={<ReportsPdf transactions={transactions} />}
      fileName={`sales-report-${startDate || "all"}-to-${endDate || "all"}.pdf`}
    >
      {({ loading }) => (
        <button
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-[#c9184a] text-white rounded-xl hover:bg-[#a11540] transition disabled:opacity-70"
        >
          <FileDown className="w-5 h-5" />
          {loading ? "Generating PDF..." : "Download PDF Report"}
        </button>
      )}
    </PDFDownloadLink>
  );
}
