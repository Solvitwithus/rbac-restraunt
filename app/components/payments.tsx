"use client";



import React, { useEffect, useState } from "react";
import {
  GetAllActiveSessions,
  GetPerSessionOrders,
  postCashPayment,
  GetProcessedTransactions,
  LoadMpesaTransactions,
  CloseSession,
} from "../hooks/access";
import { DiningSessionDTO, OrderDTO, PosPaymentResponse } from "./types";
import { toast } from "sonner";
import { pdf, PDFDownloadLink } from '@react-pdf/renderer';
import ReceiptPDF from "./restaurantReceipt";


interface MpesaTransaction {
  Auto: string;
  name: string;
  TransID: string;
  TransAmount: string;
  TransTime: string;
}

interface CartTransaction {
  sessions: DiningSessionDTO[];
  orders: OrderDTO[];
  subtotal: number;
  tax: number;
  tips: number;
  grandTotal: number;
  displayLabel: string;
}

export default function PaymentsPage() {
  const [activeSessions, setActiveSessions] = useState<DiningSessionDTO[]>([]);
  const [selectedSessionsInModal, setSelectedSessionsInModal] = useState<Set<string>>(new Set());
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [sessionOrdersMap, setSessionOrdersMap] = useState<Record<string, OrderDTO[]>>({});
  const [ordersLoading, setOrdersLoading] = useState<string | null>(null);
  const [showSessionsModal, setShowSessionsModal] = useState(false);
const [todel, settodel] = useState("")
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [cashAmountModal, setCashAmountModal] = useState(false);
const [receiptData, setReceiptData] = useState<{
  receiptDetails: {
    response: any;
    itemsSent: any[];
    totalAmount: number;
    invoiceNo: string;
  };
  cartTransaction: CartTransaction;
  clientDetails: { name: string; kra: string };
  cashAmount: number;
  selectedMpesaTrans: any;
} | null>(null);
  const [clientDetails, setClientDetails] = useState({ name: "", kra: "" });
const [loading, setloading] = useState(false)
  const [history, setHistory] = useState<PosPaymentResponse[]>([]);
  const [mpesaTransactions, setMpesaTransactions] = useState<MpesaTransaction[]>([]);
  const [mpesaModal, setMpesaModal] = useState(false);
  const [selectedMpesaTrans, setSelectedMpesaTrans] = useState<MpesaTransaction | null>(null);
const [closingSessions, setClosingSessions] = useState(false);
  const [cartTransaction, setCartTransaction] = useState<CartTransaction | null>(null);
const [selectedHistoryItem, setSelectedHistoryItem] = useState<PosPaymentResponse & {
  parsedItems?: any[];
  parsedPayments?: any[];
} | null>(null);
useEffect(() => {
  if (receiptData) {
    const printReceipt = async () => {
      try {
        console.log("Generating receipt PDF...");

        const blob = await pdf(
          <ReceiptPDF
            receiptDetails={receiptData.receiptDetails}
            cartTransaction={receiptData.cartTransaction}
            clientDetails={receiptData.clientDetails}
            cashAmount={receiptData.cashAmount}
            selectedMpesaTrans={receiptData.selectedMpesaTrans}
          />
        ).toBlob();

        console.log("PDF generated, size:", blob.size);

        const url = URL.createObjectURL(blob);

        // Open a new tab (off-screen but with real size)
        const printWindow = window.open(
          url,
          '_blank',
          'width=800,height=600,left=-10000,top=-10000,toolbar=no,location=no,menubar=no'
        );

        if (!printWindow) {
          toast.error("Popup blocked! Please allow popups for this site.");
          URL.revokeObjectURL(url);
          return;
        }

        // Wait for PDF to load, then print and close
        printWindow.onload = () => {
  setTimeout(() => {  // Small delay to ensure PDF is fully rendered
    printWindow.focus();
    printWindow.print();

    // Close only after user dismisses print dialog
    const handleAfterPrint = () => {
      printWindow.close();
      window.removeEventListener('afterprint', handleAfterPrint);
    };
    window.addEventListener('afterprint', handleAfterPrint);

    // Safety timeout in case afterprint doesn't fire
    setTimeout(() => {
      if (!printWindow.closed) printWindow.close();
    }, 60000);
  }, 800);
};

        // Cleanup
        setTimeout(() => {
          URL.revokeObjectURL(url);
          setReceiptData(null);
        }, 8000);

        toast.success("Printing receipt...");
      } catch (error) {
        console.error("Print failed:", error);
        toast.error("Failed to print receipt");
        setReceiptData(null);
      }
    };

    printReceipt();
  }
}, [receiptData]);

// Parse helpers inside component
const parsedItems = selectedHistoryItem?.pitems
  ? JSON.parse(selectedHistoryItem.pitems)
  : [];

const parsedPayments = selectedHistoryItem?.payments
  ? JSON.parse(selectedHistoryItem.payments)
  : [];
  const handleClientDetails = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClientDetails(prev => ({ ...prev, [name]: value }));
  };
const fetchData = async () => {
      try {
        const [sessionsRes, historyRes, mpesaRes] = await Promise.all([
          GetAllActiveSessions(),
          GetProcessedTransactions(),
          LoadMpesaTransactions(),
        ]);

        if (sessionsRes.status === "SUCCESS") setActiveSessions(sessionsRes.sessions || []);
        if (Array.isArray(historyRes)) setHistory(historyRes);
        if (Array.isArray(mpesaRes)) setMpesaTransactions(mpesaRes);
      } catch (e) {
        console.error("Error loading data:", e);
      }
    };
  useEffect(() => {
    
    fetchData();
  }, []);




  const loadOrdersForSession = async (sessionId: string) => {
   
    if (sessionOrdersMap[sessionId]) {
      setExpandedSessionId(expandedSessionId === sessionId ? null : sessionId);
      return;
    }

    setOrdersLoading(sessionId);
    try {
      const res = await GetPerSessionOrders({ session_id: sessionId });
      if (res.status === "SUCCESS") {
        setSessionOrdersMap(prev => ({ ...prev, [sessionId]: res.orders || [] }));
      }
      setExpandedSessionId(sessionId);
    } catch (e) {
      console.error(e);
    } finally {
      setOrdersLoading(null);
    }
  };

  const toggleSessionSelection = (sessionId: string) => {
    settodel(sessionId)
    setSelectedSessionsInModal(prev => {
      const newSet = new Set(prev);
      newSet.has(sessionId) ? newSet.delete(sessionId) : newSet.add(sessionId);
      return newSet;
    });
  };

  const handleMergeAndAddToCart = async () => {
    if (selectedSessionsInModal.size === 0) {
      alert("Select at least one session.");
      return;
    }

    const sessionsToLoad = activeSessions.filter(
      s => selectedSessionsInModal.has(s.session_id) && !sessionOrdersMap[s.session_id]
    );

    if (sessionsToLoad.length > 0) {
      setOrdersLoading("multiple");
      await Promise.all(
        sessionsToLoad.map(async s => {
          const res = await GetPerSessionOrders({ session_id: s.session_id });
          if (res.status === "SUCCESS") {
            setSessionOrdersMap(prev => ({ ...prev, [s.session_id]: res.orders || [] }));
          }
        })
      );
      setOrdersLoading(null);
    }

    const selectedSessions = activeSessions.filter(s => selectedSessionsInModal.has(s.session_id));
    const allOrders = selectedSessions.flatMap(s => sessionOrdersMap[s.session_id] || []);

    if (allOrders.length === 0) {
      alert("No orders found.");
      return;
    }

    const subtotal = allOrders.reduce((sum, o) => sum + Number(o.line_total || 0), 0);
    const tax = Number((subtotal * 0.0478).toFixed(2));
    const tips = 200;
    const grandTotal = Number((subtotal + tax + tips).toFixed(2));

    const tableLabels = selectedSessions.map(s => `${s.table_name.trim()} #${s.table_number}`).join(", ");
    const displayLabel = selectedSessions.length === 1 ? tableLabels : `Multiple Tables: ${tableLabels}`;

    setCartTransaction({
      sessions: selectedSessions,
      orders: allOrders,
      subtotal,
      tax,
      tips,
      grandTotal,
      displayLabel,
    });

    setShowSessionsModal(false);
    setSelectedSessionsInModal(new Set());
    setExpandedSessionId(null);
  };

  const clearCart = () => {
    setCartTransaction(null);
    setCashAmount(0);
    setSelectedMpesaTrans(null);
  };

  const totalTendered = cashAmount + (selectedMpesaTrans ? Number(selectedMpesaTrans.TransAmount) : 0);
  const balance = cartTransaction ? cartTransaction.grandTotal - totalTendered : 0;




const handlePayment = async () => {
  setloading(true)
  if (!cartTransaction) return;

  try {
    const itemsForBackend = cartTransaction.orders.map(order => ({
      quantity: order.quantity.toString(),
      item_option: order.item_description,
      item_option_id: order.item_code || order.id.toString(),
      price: Number(order.unit_price).toFixed(2),
      total: Number(order.line_total),
    }));

    const ordersToClear = cartTransaction.orders.map(order => ({
      order_no: order.order_no || "",
      trans_type: "30",
      reference: order.invoice_ref || `REF_${Date.now()}`,
      walk_in_customer_name: "",
    }));

    const response = await postCashPayment({
      total: cartTransaction.grandTotal,
      items: itemsForBackend,
      ordersToClear,
      customerName: clientDetails.name || "",
      customerPin: clientDetails.kra || "",
      cashAmount: cashAmount,
      mpesaTransaction: selectedMpesaTrans ? {
        name: selectedMpesaTrans.name,
        TransID: selectedMpesaTrans.TransID,
        TransAmount: selectedMpesaTrans.TransAmount,
        TransTime: selectedMpesaTrans.TransTime,
        Auto: selectedMpesaTrans.Auto,
      } : null,
    });

    if (response?.message === "Success") {
      alert(`Payment successful! Invoice #${response.invNo || "N/A"}`);

      // Close ALL sessions that were part of this transaction
      const sessionIds = cartTransaction.sessions.map(session => session.session_id);

      try {
        const closePromises = sessionIds.map(async (sessionId) => {
          try {
            const closeRes = await CloseSession({ session_id: sessionId });
            console.log(`Session ${sessionId} closed:`, closeRes);
            return closeRes;
          } catch (err) {
            console.error(`Failed to close session ${sessionId}:`, err);
            return { error: true, sessionId };
          }
        });

        const closeResults = await Promise.all(closePromises);

        const failedCloses = closeResults.filter(r => r?.error);
        if (failedCloses.length === 0) {
          toast.success("All sessions closed successfully!");
        await fetchData()

        // const latestTransaction = history[0];
      setReceiptData({
    receiptDetails: {
      response,
      itemsSent: itemsForBackend,
      totalAmount: cartTransaction.grandTotal,
      invoiceNo: response?.invNo || "N/A",
    },
    cartTransaction,
    clientDetails,
    cashAmount,
    selectedMpesaTrans,
  });
 
        //   toast.success(latestTransaction.invNo)
        } else {
          toast.warning(`Payment successful, but ${failedCloses.length} session(s) failed to close.`);
        }

        // Refresh active sessions list
        const refreshed = await GetAllActiveSessions();
        if (refreshed.status === "SUCCESS") {
          setActiveSessions(refreshed.sessions || []);
          
        }
      } catch (err) {
        console.error("Error closing sessions:", err);
        toast.warning("Payment successful, but failed to close sessions.");
      }

      // Clear the cart
      clearCart();
    } else {
      alert(response?.message || "Payment failed");
    }
  } catch (err: any) {
    toast.error("Payment failed: " + (err.message || "Network error"));
    console.error(err);
  }
  finally{
    setloading(false)
  }
};
  const selectedCount = selectedSessionsInModal.size;

const reprintHistoryReceipt = async () => {
  if (!selectedHistoryItem) return;

  try {
    console.log("Reprinting history receipt...");

    // Parse items and payments
    const parsedItems = selectedHistoryItem.parsedItems ||
      (selectedHistoryItem.pitems ? JSON.parse(selectedHistoryItem.pitems) : []);

    const parsedPayments = selectedHistoryItem.parsedPayments ||
      (selectedHistoryItem.payments ? JSON.parse(selectedHistoryItem.payments) : []);

    // Map to itemsSent format
    const itemsSent = parsedItems.map((it: any) => ({
      item_option: it.item_option || it.item_description || "Unknown Item",
      quantity: it.quantity?.toString() || "1",
      price: Number(it.price || it.unit_price || 0).toFixed(2),
      total: Number(it.total || it.line_total || 0),
    }));

    const totalAmount = Number(selectedHistoryItem.ptotal || 0);

    // Find M-Pesa transaction
    const mpesaTrans = parsedPayments.find((p: any) =>
      p.Transtype === "MPESA" || p.Transtype === "M-PESA"
    );

    // Calculate cash amount
    const cashPaid = mpesaTrans
      ? totalAmount - Number(mpesaTrans.TransAmount || 0)
      : totalAmount;

    // Generate PDF blob
    const blob = await pdf(
      <ReceiptPDF
        receiptDetails={{
          response: {
            invNo: selectedHistoryItem.invNo,
            delNo: selectedHistoryItem.delNo || null,
            mpesaRef: mpesaTrans?.TransID || null,
          },
          itemsSent,
          totalAmount,
          invoiceNo: selectedHistoryItem.invNo,
        }}
        cartTransaction={{
          subtotal: totalAmount - totalAmount * 0.0478 - 200,
          tax: totalAmount * 0.0478,
          tips: 200,
          grandTotal: totalAmount,
          displayLabel: `Reprint - ${selectedHistoryItem.pdate}`,
        }}
        clientDetails={{
          name: selectedHistoryItem.cust_name ||
                 selectedHistoryItem.walk_in_customer_name ||
                 "Walk-in Customer",
          kra: selectedHistoryItem.cust_pin || "",
        }}
        cashAmount={cashPaid >= 0 ? cashPaid : 0}
        selectedMpesaTrans={mpesaTrans || null}
      />
    ).toBlob();

    const url = URL.createObjectURL(blob);

    // Open a hidden popup window
    const printWindow = window.open('', '_blank', 'width=800,height=600,left=-10000,top=-10000');

    if (!printWindow) {
      toast.error("Popup blocked! Please allow popups for reprinting.");
      URL.revokeObjectURL(url);
      return;
    }

    // Write HTML with embedded iframe and smart printing logic
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Reprint Receipt #${selectedHistoryItem.invNo}</title>
          <style>
            body { margin: 0; padding: 0; overflow: hidden; }
            iframe { width: 100vw; height: 100vh; border: none; }
          </style>
        </head>
        <body>
          <iframe src="${url}" frameborder="0"></iframe>
          <script>
            // Focus the window and trigger print when PDF is ready
            window.onload = () => {
              const iframe = document.querySelector('iframe');
              iframe.onload = () => {
                setTimeout(() => {
                  window.focus();           // Bring to front
                  window.print();           // Open print dialog

                  // Listen for when user finishes printing (print or cancel)
                  window.addEventListener('afterprint', () => {
                    window.close();
                  });

                  // Safety fallback: close after 60 seconds if afterprint doesn't fire
                  setTimeout(() => {
                    if (!window.closed) window.close();
                  }, 60000);
                }, 600);
              };
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();

    toast.success("Reprinting receipt...");

    // Optional: cleanup blob URL after some time
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 60000);

  } catch (error) {
    console.error("Reprint failed:", error);
    toast.error("Failed to reprint receipt");
  }
};


  return (
    <>
      <div className=" bg-[#F7F5EE]">
        <div className="p-4 md:p-6 lg:p-6">
          <div className="grid grid-cols-1 md:grid-cols-8 lg:grid-cols-12 gap-6">
            {/* Left: History */}
            <div className="md:col-span-2 space-y-6 border-r border-black/20 pr-4">
              <button
                onClick={() => setShowSessionsModal(true)}
                className="w-full py-4 bg-amber-700 text-white font-bold rounded-lg hover:bg-amber-800"
              >
                Load Active Sessions
              </button>

              <div className="space-y-3 max-h-[80vh] overflow-y-auto">
  <h3 className="font-bold text-lg sticky top-0 bg-[#F7F5EE] py-2 z-10">Payment History</h3>
  
{history.length === 0 ? (
  <p className="text-center text-gray-500 text-sm py-8">No payments yet</p>
) : (
  history.map(transaction => (
    <div
      key={transaction.id}
      onClick={() => {
        // Now safe to use 'item' or keep using 'transaction'
        const freshItem = history.find(h => h.id === transaction.id);
        if (freshItem) {
          const parsedItems = freshItem.pitems ? JSON.parse(freshItem.pitems) : [];
          const parsedPayments = freshItem.payments ? JSON.parse(freshItem.payments) : [];

          setSelectedHistoryItem({
            ...freshItem,
            parsedItems,
            parsedPayments,
          });
        }
      }}
      className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md hover:border-amber-400 cursor-pointer transition-all"
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="font-bold text-amber-900">Invoice #{transaction.invNo}</div>
          <div className="text-sm text-gray-600 mt-1">{transaction.pdate}</div>
          <div className="text-xs text-gray-500 mt-1">Order #{transaction.order_no}</div>
        </div>
        <div className="text-right">
          <div className="font-bold text-xl text-amber-900">
            Ksh {Number(transaction.ptotal).toFixed(2)}
          </div>
          <div className="text-sm text-gray-600">{transaction.ptype}</div>
        </div>
      </div>
    </div>
  ))
)}
</div>


{/* Selected History Item Modal */}
{selectedHistoryItem && (
  <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-amber-700 text-white p-6">
        <h2 className="text-2xl font-bold">Receipt - Invoice #{selectedHistoryItem.invNo}</h2>
        <p className="text-amber-100 mt-1">{selectedHistoryItem.pdate}</p>
      </div>

      {/* Body - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Customer Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-600">Customer:</span>
            <p className="font-semibold">{selectedHistoryItem.cust_name || selectedHistoryItem.walk_in_customer_name || "Walk-in"}</p>
          </div>
          <div>
            <span className="font-medium text-gray-600">Order #:</span>
            <p className="font-semibold">{selectedHistoryItem.order_no}</p>
          </div>
          {selectedHistoryItem.cust_pin && (
            <div>
              <span className="font-medium text-gray-600">KRA Pin:</span>
              <p className="font-semibold">{selectedHistoryItem.cust_pin}</p>
            </div>
          )}
          <div>
            <span className="font-medium text-gray-600">Served by:</span>
            <p className="font-semibold">{selectedHistoryItem.uname || "N/A"}</p>
          </div>
        </div>

        <div className="border-t pt-4" />

        {/* Items List */}
        <div>
          <h3 className="font-bold text-lg mb-3">Items Ordered</h3>
          {parsedItems.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No items found</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left py-3 px-4">Item</th>
                  <th className="text-center py-3 px-4">Qty</th>
                  <th className="text-right py-3 px-4">Price</th>
                  <th className="text-right py-3 px-4">Total</th>
                </tr>
              </thead>
              <tbody>
                {parsedItems.map((it, i) => (
                  <tr key={i} className="border-t">
                    <td className="py-3 px-4">{it.item_option}</td>
                    <td className="text-center py-3 px-4">{it.quantity}</td>
                    <td className="text-right py-3 px-4">Ksh {Number(it.price).toFixed(2)}</td>
                    <td className="text-right py-3 px-4 font-semibold">Ksh {Number(it.total).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="border-t pt-4" />

        {/* Payment Breakdown */}
        <div>
          <h3 className="font-bold text-lg mb-3">Payment Details</h3>
          <div className="space-y-2">
            {parsedPayments.map((pay, i) => (
              <div key={i} className="flex justify-between text-sm py-2 px-4 bg-gray-50 rounded">
                <div>
                  <span className="font-medium">{pay.name || pay.Transtype}</span>
                  {pay.TransID && pay.Transtype === "MPESA" && (
                    <span className="block text-xs text-gray-600">Ref: {pay.TransID}</span>
                  )}
                </div>
                <span className="font-bold text-green-700">
                  Ksh {Number(pay.TransAmount || 0).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="border-t-2 border-amber-700 pt-4 text-right">
          <p className="text-2xl font-bold text-amber-900">
            Total Paid: Ksh {Number(selectedHistoryItem.ptotal).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="p-6 border-t bg-gray-50 flex gap-4">
        <button
          onClick={() => setSelectedHistoryItem(null)}
          className="flex-1 py-3 border border-gray-400 rounded-lg font-medium hover:bg-gray-100"
        >
          Close
        </button>
      <button
  onClick={reprintHistoryReceipt}
  className="flex-1 py-3 bg-amber-700 text-white rounded-lg font-medium hover:bg-amber-800"
>
  Reprint Receipt
</button>
      </div>
    </div>
  </div>
)}
            </div>

            {/* Center: Bill */}
            <div className="md:col-span-6 lg:col-span-7">
              {cartTransaction ? (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold">{cartTransaction.displayLabel}</h2>
                      <p className="text-gray-600">{cartTransaction.orders.length} items</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-amber-900">
                        Ksh {cartTransaction.grandTotal.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto mb-6">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="text-left py-3 px-4">Item</th>
                          <th className="text-center py-3 px-4">Qty</th>
                          <th className="text-right py-3 px-4">Price</th>
                          <th className="text-right py-3 px-4">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cartTransaction.orders.map((o, i) => (
                          <tr key={i} className="border-t">
                            <td className="py-3 px-4">{o.item_description}</td>
                            <td className="text-center py-3 px-4">{o.quantity}</td>
                            <td className="text-right py-3 px-4">Ksh {Number(o.unit_price).toFixed(2)}</td>
                            <td className="text-right py-3 px-4 font-semibold">Ksh {Number(o.line_total).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="text-right space-y-2 text-lg">
                    <div>Subtotal: <strong>Ksh {cartTransaction.subtotal.toFixed(2)}</strong></div>
                    <div>Tax (4.78%): <strong>Ksh {cartTransaction.tax.toFixed(2)}</strong></div>
                    <div className="text-amber-700">Tips: <strong>Ksh 200.00</strong></div>
                    <div className="text-2xl font-bold text-amber-900">
                      Grand Total: Ksh {cartTransaction.grandTotal.toFixed(2)}
                    </div>
                  </div>

                  <button onClick={clearCart} className="mt-8 px-6 py-3 bg-red-600 text-white rounded-lg">
                    Clear Bill
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border p-12 text-center text-gray-500">
                  <h3 className="text-2xl font-medium mb-4">No Bill Loaded</h3>
                  <p>Load sessions and select tables to start.</p>
                </div>
              )}
            </div>

            {/* Right: Payment */}
            <div className="md:col-span-8 md:col-start-1 lg:col-span-3 lg:col-start-auto space-y-6">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="font-bold text-lg mb-4">Customer Details</h3>
                <input
                  name="name"
                  value={clientDetails.name}
                  onChange={handleClientDetails}
                  placeholder="Name"
                  className="w-full px-4 py-3 border rounded-lg mb-3"
                />
                <input
                  name="kra"
                  value={clientDetails.kra}
                  onChange={handleClientDetails}
                  placeholder="KRA Pin (Optional)"
                  className="w-full px-4 py-3 border rounded-lg mb-6"
                />

                <button
                type="button"

                  onClick={handlePayment}
                  disabled={!cartTransaction || balance > 0 ||loading}
                  className={`w-full py-4 font-bold rounded-lg text-lg transition ${
                    !cartTransaction || balance > 0 ||loading
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                      : "bg-rose-600 text-white hover:bg-rose-700"
                  }`}
                >
                 {loading?"Processing":" Process Payment"}
                </button>

                <div className="mt-6 space-y-4 text-lg">
                  <div className="flex justify-between">
                    <span>Total Due</span>
                    <span className="font-bold text-amber-900">
                      Ksh {cartTransaction?.grandTotal.toFixed(2) || "0.00"}
                    </span>
                  </div>

                  {selectedMpesaTrans && (
                    <div className="flex justify-between text-green-700">
                      <span>M-Pesa ({selectedMpesaTrans.TransID})</span>
                      <span className="font-bold">Ksh {Number(selectedMpesaTrans.TransAmount).toFixed(2)}</span>
                    </div>
                  )}

                  {cashAmount > 0 && (
                    <div className="flex justify-between text-blue-700">
                      <span>Cash Tendered</span>
                      <span className="font-bold">Ksh {cashAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-xl font-bold border-t pt-4">
                    <span>{balance > 0 ? "Balance Due" : "Change Due"}</span>
                    <span className={balance > 0 ? "text-red-600" : "text-green-600"}>
                      Ksh {Math.abs(balance).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="font-bold mb-4">Payment Method</h3>

                <button
                  onClick={() => setCashAmountModal(true)}
                  className={`w-full text-left px-5 py-4 border rounded-lg hover:bg-gray-50 mb-3 font-medium ${
                    cashAmount > 0 ? "bg-blue-50 border-blue-500" : ""
                  }`}
                >
                  Cash {cashAmount > 0 && `(Ksh ${cashAmount.toFixed(2)})`}
                </button>

                <button
                  onClick={() => setMpesaModal(true)}
                  className={`w-full text-left px-5 py-4 border rounded-lg hover:bg-gray-50 mb-3 font-medium ${
                    selectedMpesaTrans ? "bg-green-50 border-green-500" : ""
                  }`}
                >
                  M-Pesa {selectedMpesaTrans && `(${selectedMpesaTrans.TransID})`}
                </button>

                {["Family Bank", "Manual Bank"].map(m => (
                  <button key={m} className="w-full text-left px-5 py-4 border rounded-lg hover:bg-gray-50 mb-2 font-medium">
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cash Modal */}
      {cashAmountModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-6">Enter Cash Amount</h3>
            <input
              type="number"
              value={cashAmount}
              onChange={e => setCashAmount(Number(e.target.value) || 0)}
              className="w-full px-6 py-5 text-3xl text-center border-2 rounded-xl"
              placeholder="0.00"
              min="0"
            />
            <div className="flex gap-4 mt-8">
              <button onClick={() => { setCashAmountModal(false); setCashAmount(0); }} className="flex-1 py-3 border rounded-lg">
                Cancel
              </button>
              <button onClick={() => setCashAmountModal(false)} className="flex-1 py-3 bg-amber-700 text-white rounded-lg">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* M-Pesa Modal */}
      {mpesaModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold">Select M-Pesa Transaction</h3>
              <button onClick={() => { setMpesaModal(false); setSelectedMpesaTrans(null); }} className="text-3xl">&times;</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {mpesaTransactions.length === 0 ? (
                <p className="text-center text-gray-500 py-10">No M-Pesa transactions</p>
              ) : (
                <div className="space-y-3">
                  {mpesaTransactions.map(tx => (
                    <div
                      key={tx.Auto}
                      onClick={() => {
                        setSelectedMpesaTrans(tx);
                        setMpesaModal(false);
                      }}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                        selectedMpesaTrans?.TransID === tx.TransID ? "border-green-500 bg-green-50" : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex justify-between">
                        <div>
                          <p className="font-semibold">{tx.name}</p>
                          <p className="text-sm text-gray-600">Ref: {tx.TransID}</p>
                          <p className="text-xs text-gray-500">{tx.TransTime}</p>
                        </div>
                        <p className="text-xl font-bold text-green-700">
                          Ksh {Number(tx.TransAmount).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t">
              <button onClick={() => { setMpesaModal(false); setSelectedMpesaTrans(null); }} className="w-full py-3 border rounded-lg font-medium">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Sessions Modal */}
      {showSessionsModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Active Sessions ({activeSessions.length})</h2>
              <button onClick={() => setShowSessionsModal(false)} className="text-4xl">&times;</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {activeSessions.map(session => (
                  <div
                    key={session.session_id}
                    className={`border-2 rounded-xl overflow-hidden ${
                      selectedSessionsInModal.has(session.session_id) ? "border-amber-500 shadow-lg" : "border-gray-200"
                    }`}
                  >
                    <div
                      onClick={() => loadOrdersForSession(session.session_id)}
                      className="p-5 bg-gradient-to-r from-amber-50 to-amber-100 cursor-pointer flex items-center gap-4"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSessionsInModal.has(session.session_id)}
                        onChange={() => toggleSessionSelection(session.session_id)}
                        onClick={e => e.stopPropagation()}
                        className="w-5 h-5"
                      />
                      <div className="flex-1">
                        <div className="font-bold text-xl">{session.table_name.trim()} #{session.table_number}</div>
                        <div className="text-sm text-gray-700">{session.guest_count} guests • {session.duration_formatted}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-amber-900">
                          Ksh {Number(session.total_amount).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {expandedSessionId === session.session_id && (
                      <div className="p-6 bg-gray-50 border-t">
                        {sessionOrdersMap[session.session_id]?.length ? (
                          <table className="w-full text-sm">
                            <thead className="bg-gray-200">
                              <tr>
                                <th className="text-left py-2 px-4">Item</th>
                                <th className="text-center py-2 px-4">Qty</th>
                                <th className="text-right py-2 px-4">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sessionOrdersMap[session.session_id].map((o, i) => (
                                <tr key={i}>
                                  <td className="py-2 px-4">{o.item_description}</td>
                                  <td className="text-center py-2 px-4">{o.quantity}</td>
                                  <td className="text-right py-2 px-4 font-medium">Ksh {Number(o.line_total).toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p className="text-center text-gray-600 py-6">No orders</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-4">
              <button onClick={() => setShowSessionsModal(false)} className="px-8 py-3 border rounded-lg">
                Cancel
              </button>
              <button
                onClick={handleMergeAndAddToCart}
                disabled={selectedCount === 0}
                className={`px-8 py-3 rounded-lg font-medium ${
                  selectedCount > 0 ? "bg-amber-700 text-white" : "bg-gray-300 text-gray-600"
                }`}
              >
                {selectedCount > 1 ? `Merge ${selectedCount}` : "Add to Bill"}
              </button>
            </div>
          </div>
          {/* Hidden Printable Receipt - for silent thermal printing */}
<div style={{ display: 'none' }}>
  <div id="printable-receipt">
    {receiptData && (
      <div style={{
        width: '80mm',
        fontFamily: 'monospace',
        fontSize: '12px',
        padding: '10px',
        lineHeight: '1.4',
      }}>
        <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px' }}>
          YOUR RESTAURANT
        </div>
        <div style={{ textAlign: 'center' }}>Nairobi, Kenya</div>
        <div style={{ textAlign: 'center' }}>Phone: +254 700 000 000</div>
        <div style={{ textAlign: 'center' }}>TIN: P000123456A</div>
        <div style={{ borderBottom: '1px dashed #000', margin: '10px 0' }}></div>

        <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
          OFFICIAL RECEIPT
        </div>

        <div>Invoice #: {receiptData.receiptDetails.invoiceNo}</div>
        <div>Date: {new Date().toLocaleDateString('en-GB')}</div>
        <div>Time: {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
        <div>Table: {receiptData.cartTransaction.displayLabel}</div>

        <div style={{ borderBottom: '1px dashed #000', margin: '10px 0' }}></div>

        {receiptData.receiptDetails.itemsSent.map((item, i) => (
          <div key={i}>
            <div>{item.item_option}</div>
            <div style={{ marginLeft: '20px' }}>
              {parseFloat(item.quantity)} × KES {parseFloat(item.price).toFixed(2)} = KES {item.total.toFixed(2)}
            </div>
          </div>
        ))}

        <div style={{ borderBottom: '1px dashed #000', margin: '10px 0' }}></div>

        <div>Subtotal: KES {receiptData.cartTransaction.subtotal.toFixed(2)}</div>
        <div>VAT: KES {receiptData.cartTransaction.tax.toFixed(2)}</div>
        <div>Tips: KES {receiptData.cartTransaction.tips.toFixed(2)}</div>
        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
          GRAND TOTAL: KES {receiptData.receiptDetails.totalAmount.toFixed(2)}
        </div>

        <div style={{ borderBottom: '1px dashed #000', margin: '10px 0' }}></div>

        <div>Paid by Cash: KES {receiptData.cashAmount.toFixed(2)}</div>
        {receiptData.selectedMpesaTrans && (
          <>
            <div>Paid by M-Pesa: KES {parseFloat(receiptData.selectedMpesaTrans.TransAmount).toFixed(2)}</div>
            <div>M-Pesa Ref: {receiptData.selectedMpesaTrans.TransID}</div>
          </>
        )}

        {receiptData.clientDetails.name && (
          <>
            <div style={{ borderBottom: '1px dashed #000', margin: '10px 0' }}></div>
            <div>Customer: {receiptData.clientDetails.name}</div>
            {receiptData.clientDetails.kra && <div>KRA PIN: {receiptData.clientDetails.kra}</div>}
          </>
        )}

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <div style={{ fontWeight: 'bold' }}>*** THANK YOU! ***</div>
          <div>Come Again Soon</div>
        </div>
      </div>
    )}
  </div>
</div>
        </div>
      )}
    </>
  );
}