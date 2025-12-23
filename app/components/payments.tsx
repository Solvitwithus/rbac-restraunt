"use client";




// import React, { useEffect, useState } from "react";
// import {
//   GetAllActiveSessions,
//   GetPerSessionOrders,
//   postCashPayment,GetProcessedTransactions,LoadMpesaTransactions } from "../hooks/access"
// import { DiningSessionDTO, OrderDTO, PaymentTransaction, PosPaymentResponse } from "./types"; // Adjust if needed

// interface CartTransaction {
//   sessions: DiningSessionDTO[];
//   orders: OrderDTO[];
//   subtotal: number;
//   tax: number; // 4.78%
//   tips: number;
//   grandTotal: number;
//   displayLabel: string;
// }

// export default function PaymentsPage() {
//   const [activeSessions, setActiveSessions] = useState<DiningSessionDTO[]>([]);
//   const [selectedSessionsInModal, setSelectedSessionsInModal] = useState<Set<string>>(new Set());
//   const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
//   const [sessionOrdersMap, setSessionOrdersMap] = useState<Record<string, OrderDTO[]>>({});
//   const [ordersLoading, setOrdersLoading] = useState<string | null>(null);
//   const [showSessionsModal, setShowSessionsModal] = useState(false);
//   const [cashAmount, setCashAmount] = useState<number>(0);
//   const [cashAmountModal, setCashAmountModal] = useState(false);
// const [history, sethistory] = useState<PosPaymentResponse[]>([])
//   const [clientDetails, setClientDetails] = useState({ name: "", kra: "" });
// const [mpesaTransactions, setmpesaTransactions] = useState<PaymentTransaction[]>([])
//   const [cartTransaction, setCartTransaction] = useState<CartTransaction | null>(null);
// const [mpesaModal, setMpesaModal] = useState(false)
// const [selectedMpesaTrans, setselectedMpesaTrans] = useState("")
//   const handleClientDetails = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setClientDetails(prev => ({ ...prev, [name]: value }));
//   };

//   // Load active sessions on mount
//   useEffect(() => {
//     const fetchSessions = async () => {
//       try {
//         const res = await GetAllActiveSessions();
//         if (res.status === "SUCCESS" && Array.isArray(res.sessions)) {
//           setActiveSessions(res.sessions);
//         }
//       } catch (e) {
//         console.error("Failed to load sessions:", e);
//       }
//     };

//     const fetchProcessedTransactions = async ()=>{
//       try{
// const res = await GetProcessedTransactions()
// console.log("pppoiui",res);

// sethistory(res ??[])
//       }
// catch (e) {
//         console.error("Failed to load sessions:", e);
//       }
//     }

//     const fetchMpesaTransactions = async ()=>{
//       try{
// const res = await LoadMpesaTransactions()


// setmpesaTransactions(res ??[])
//       }
// catch (e) {
//         console.error("Failed to load sessions:", e);
//       }
//     }
//     fetchSessions();
//     fetchProcessedTransactions();
//     fetchMpesaTransactions();
//   }, []);

//   // Expand/collapse and load orders
//   const loadOrdersForSession = async (sessionId: string) => {
//     if (sessionOrdersMap[sessionId]) {
//       setExpandedSessionId(expandedSessionId === sessionId ? null : sessionId);
//       return;
//     }

//     setOrdersLoading(sessionId);
//     try {
//       const res = await GetPerSessionOrders({ session_id: sessionId });
//       if (res.status === "SUCCESS") {
//         setSessionOrdersMap(prev => ({ ...prev, [sessionId]: res.orders || [] }));
//       }
//       setExpandedSessionId(sessionId);
//     } catch (e) {
//       console.error(e);
//       setSessionOrdersMap(prev => ({ ...prev, [sessionId]: [] }));
//     } finally {
//       setOrdersLoading(null);
//     }
//   };

//   const toggleSessionSelection = (sessionId: string) => {
//     setSelectedSessionsInModal(prev => {
//       const newSet = new Set(prev);
//       newSet.has(sessionId) ? newSet.delete(sessionId) : newSet.add(sessionId);
//       return newSet;
//     });
//   };

//   // Add selected (or merged) sessions to cart
//   const handleMergeAndAddToCart = async () => {
//     if (selectedSessionsInModal.size === 0) {
//       alert("Please select at least one session.");
//       return;
//     }

//     const sessionsToLoad = activeSessions.filter(
//       s => selectedSessionsInModal.has(s.session_id) && !sessionOrdersMap[s.session_id]
//     );

//     if (sessionsToLoad.length > 0) {
//       setOrdersLoading("multiple");
//       await Promise.all(
//         sessionsToLoad.map(async s => {
//           try {
//             const res = await GetPerSessionOrders({ session_id: s.session_id });
//             if (res.status === "SUCCESS") {
//               setSessionOrdersMap(prev => ({ ...prev, [s.session_id]: res.orders || [] }));
//             }
//           } catch (e) {
//             console.error(e);
//           }
//         })
//       );
//       setOrdersLoading(null);
//     }

//     const selectedSessions = activeSessions.filter(s => selectedSessionsInModal.has(s.session_id));
//     const allOrders = selectedSessions.flatMap(s => sessionOrdersMap[s.session_id] || []);

//     if (allOrders.length === 0) {
//       alert("Selected sessions have no orders yet.");
//       return;
//     }

//     const subtotal = allOrders.reduce((sum, o) => sum + Number(o.line_total || 0), 0);
//     const tax = Number((subtotal * 0.0478).toFixed(2));
//     const tips = 200;
//     const grandTotal = Number((subtotal + tax + tips).toFixed(2));

//     const tableLabels = selectedSessions.map(s => `${s.table_name.trim()} #${s.table_number}`).join(", ");
//     const displayLabel = selectedSessions.length === 1 ? tableLabels : `Multiple Tables: ${tableLabels}`;

//     setCartTransaction({
//       sessions: selectedSessions,
//       orders: allOrders,
//       subtotal,
//       tax,
//       tips,
//       grandTotal,
//       displayLabel,
//     });

//     setShowSessionsModal(false);
//     setSelectedSessionsInModal(new Set());
//     setExpandedSessionId(null);
//   };

//   const clearCart = () => {
//     setCartTransaction(null);
//     setCashAmount(0);
//   };

//   const balance = cartTransaction ? cartTransaction.grandTotal - cashAmount : 0;
// const mpesaBalance = cartTransaction ? cartTransaction.grandTotal - selectedMpesaTrans.TransAmount : 0;
//   const handlePayment = async () => {
//     if (!cartTransaction) return;

//     try {
//       const itemsForBackend = cartTransaction.orders.map(order => ({
//         quantity: order.quantity,
//         item_option: order.item_description,
//         item_option_id: order.item_code || order.id.toString(),
//         price: Number(order.unit_price).toFixed(2),
//         total: Number(order.line_total),
//       }));

//       const ordersToClear = cartTransaction.orders.map(order => ({
//         order_no: order.order_no || "",
//         trans_type: "30",
//         reference: order.invoice_ref || `REF_${Date.now()}`,
//       }));

//       const response = await postCashPayment({
//         total: cartTransaction.grandTotal,
//         items: itemsForBackend,
//         ordersToClear,
//         customerName: clientDetails.name,
//         customerPin: clientDetails.kra,
//       });

//       if (response?.status === "SUCCESS") {
//         alert("Payment processed successfully!");
//         clearCart();
//       } else {
//         alert(response?.message || "Payment failed");
//       }
//     } catch (err: any) {
//       alert("Error: " + (err.message || "Unknown"));
//       console.error(err);
//     }
//   };

//   const selectedCount = selectedSessionsInModal.size;

//   return (
//     <>
//       <div className="bg-[#F7F5EE]">
//         <div className="p-4 md:p-6 lg:p-6">
//           <div className="grid grid-cols-1 md:grid-cols-8 lg:grid-cols-12 gap-6">
//             {/* Left Panel */}
//             <div className="md:col-span-2 space-y-6 border-r border-black/30 pr-2">
//               <button
//                 onClick={() => setShowSessionsModal(true)}
//                 className="w-full py-4 bg-amber-700 text-white font-bold rounded-lg hover:bg-amber-800 transition flex items-center justify-center gap-3"
//               >
//                 Load Active Sessions
//               </button>

//                {history.length === 0 ? (
//     <p className="text-sm text-gray-500 text-center">
//       No payment history
//     </p>
//   ) : (
//     history.map((item) => (
//       <div
//         key={item.id}
//         className="bg-white border border-gray-200 rounded-lg p-3 hover:bg-amber-50 cursor-pointer transition"
//       >
//         <div className="flex justify-between items-center">
//           <span className="font-bold text-sm">
//             Invoice #{item.invNo}
//           </span>
//           <span className="text-xs text-gray-500">
//             {item.pdate}
//           </span>
//         </div>

//         <div className="flex justify-between mt-2 text-sm">
//           <span className="text-gray-700">
//             {item.ptype}
//           </span>
//           <span className="font-bold text-amber-900">
//             Ksh {Number(item.ptotal).toFixed(2)}
//           </span>
//         </div>

//         <div className="text-xs text-gray-500 mt-1">
//           Order #{item.order_no}
//         </div>
//       </div>
//     ))
//   )}

           
//             </div>

//             {/* Center Panel */}
//             <div className="md:col-span-6 lg:col-span-7">
//               {cartTransaction ? (
//                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//                   <div className="flex justify-between items-start mb-6">
//                     <div>
//                       <h2 className="text-2xl font-bold">{cartTransaction.displayLabel}</h2>
//                       <p className="text-gray-600 mt-1">
//                         {cartTransaction.sessions.length} table(s) • {cartTransaction.orders.length} item(s)
//                       </p>
//                     </div>
//                     <div className="text-right">
//                       <p className="text-3xl font-bold text-amber-900">
//                         Ksh {cartTransaction.grandTotal.toFixed(2)}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="overflow-x-auto">
//                     <table className="w-full text-sm">
//                       <thead className="bg-gray-100">
//                         <tr>
//                           <th className="px-4 py-3 text-left">Item</th>
//                           <th className="px-4 py-3 text-center">Qty</th>
//                           <th className="px-4 py-3 text-right">Price</th>
//                           <th className="px-4 py-3 text-right">Total</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {cartTransaction.orders.map((order, i) => (
//                           <tr key={i} className="border-t">
//                             <td className="px-4 py-3">{order.item_description}</td>
//                             <td className="px-4 py-3 text-center">{order.quantity}</td>
//                             <td className="px-4 py-3 text-right">Ksh {Number(order.unit_price).toFixed(2)}</td>
//                             <td className="px-4 py-3 text-right font-semibold">Ksh {Number(order.line_total).toFixed(2)}</td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>

//                   <div className="mt-6 text-right space-y-2 text-lg">
//                     <div>Subtotal: <strong>Ksh {cartTransaction.subtotal.toFixed(2)}</strong></div>
//                     <div>Tax (4.78%): <strong>Ksh {cartTransaction.tax.toFixed(2)}</strong></div>
//                     <div className="text-amber-700">Tips: <strong>Ksh 200.00</strong></div>
//                     <div className="text-2xl font-bold text-amber-900">
//                       Grand Total: Ksh {cartTransaction.grandTotal.toFixed(2)}
//                     </div>
//                   </div>

//                   <button onClick={clearCart} className="mt-8 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700">
//                     Clear Transaction
//                   </button>
//                 </div>
//               ) : (
//                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-500">
//                   <h3 className="text-2xl font-medium mb-4">No Transaction Loaded</h3>
//                   <p>Click "Load Active Sessions" and select tables to begin payment.</p>
//                 </div>
//               )}
//             </div>

//             {/* Right Panel */}
//             <div className="md:col-span-8 md:col-start-1 lg:col-span-3 lg:col-start-auto space-y-6">
//               <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//                 <h3 className="font-bold text-lg mb-4">Customer Details</h3>
//                 <input
//                   name="name"
//                   value={clientDetails.name}
//                   onChange={handleClientDetails}
//                   placeholder="Customer Name"
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3"
//                 />
//                 <input
//                   name="kra"
//                   value={clientDetails.kra}
//                   onChange={handleClientDetails}
//                   placeholder="KRA Pin (Optional)"
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-6"
//                 />

//                 <button
//                   onClick={handlePayment}
//                   disabled={!cartTransaction || balance > 0}
//                   className={`w-full py-4 font-bold rounded-lg text-lg transition ${
//                     !cartTransaction || balance > 0
//                       ? "bg-gray-400 text-gray-600 cursor-not-allowed"
//                       : "bg-rose-600 text-white hover:bg-rose-700"
//                   }`}
//                 >
//                   Process Payment
//                 </button>

//                 <div className="mt-8 space-y-4 text-lg">
//                   <div className="flex justify-between">
//                     <span>Total Due</span>
//                     <span className="font-bold text-amber-900">
//                       Ksh {cartTransaction?.grandTotal.toFixed(2) || "0.00"}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span>Tendered</span>
//                     <span className="font-bold">Ksh {cashAmount.toFixed(2) || selectedMpesaTrans ?selectedMpesaTrans.TransAmount:0}</span>
//                   </div>
//                   <div className="flex justify-between text-xl font-bold border-t pt-4">
//                     <span>Balance / Change</span>
//                     <span className={balance > 0 ? "text-red-600" : "text-green-600"}>
//                       Ksh {balance.toFixed(2) || mpesaBalance|| mpesaBalance+balance}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//                 <p className="font-bold mb-4">Payment Method</p>
//                 <button
//                   onClick={() => setCashAmountModal(true)}
//                   className="w-full text-left px-5 py-4 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium mb-3"
//                 >
//                   Cash
//                 </button>


                

//                  <button
//                   onClick={() => setMpesaModal(true)}
//                   className="w-full text-left px-5 py-4 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium mb-3"
//                 >
//                   Mpesa
//                 </button>
//                 {[ "Family Bank", "Manual Bank"].map(m => (
//                   <button key={m} className="w-full text-left px-5 py-4 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium mb-2">
//                     {m}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Cash Amount Modal */}
//       {cashAmountModal && (
//         <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
//             <h3 className="text-2xl font-bold mb-6">Enter Cash Amount</h3>
//             <input
//               type="number"
//               value={cashAmount}
//               onChange={e => setCashAmount(Number(e.target.value) || 0)}
//               className="w-full px-6 py-5 text-3xl border-2 border-gray-400 rounded-xl text-center font-medium"
//               placeholder="0.00"
//               min="0"
//               step="10"
//             />
//             <div className="grid grid-cols-2 gap-4 mt-8">
//               <button
//                 onClick={() => {
//                   setCashAmountModal(false);
//                   setCashAmount(0);
//                 }}
//                 className="py-3 border border-gray-400 rounded-lg font-medium"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={() => setCashAmountModal(false)}
//                 className="py-3 bg-amber-700 text-white rounded-lg font-medium"
//               >
//                 Confirm
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Active Sessions Modal */}
//       {showSessionsModal && (
//         <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col">
//             <div className="flex justify-between items-center p-6 border-b bg-gray-50">
//               <div>
//                 <h2 className="text-2xl font-bold">Active Dining Sessions ({activeSessions.length})</h2>
//                 {selectedCount > 0 && (
//                   <p className="text-sm text-amber-700 mt-1">{selectedCount} selected</p>
//                 )}
//               </div>
//               <button onClick={() => setShowSessionsModal(false)} className="text-4xl text-gray-500 hover:text-gray-800">
//                 ×
//               </button>
//             </div>

//             <div className="overflow-y-auto flex-1 p-6">
//               {activeSessions.length === 0 ? (
//                 <div className="text-center py-20 text-gray-500">
//                   <p className="text-xl">No active sessions found</p>
//                 </div>
//               ) : (
//                 <div className="space-y-6">
//                   {activeSessions.map(session => (
//                     <div
//                       key={session.session_id}
//                       className={`border-2 rounded-xl overflow-hidden transition-all ${
//                         selectedSessionsInModal.has(session.session_id)
//                           ? "border-amber-500 shadow-lg ring-2 ring-amber-200"
//                           : "border-gray-200"
//                       }`}
//                     >
//                       <div
//                         className="p-5 bg-gradient-to-r from-amber-50 to-amber-100 cursor-pointer flex items-center gap-4"
//                         onClick={() => loadOrdersForSession(session.session_id)}
//                       >
//                         <input
//                           type="checkbox"
//                           checked={selectedSessionsInModal.has(session.session_id)}
//                           onChange={() => toggleSessionSelection(session.session_id)}
//                           onClick={e => e.stopPropagation()}
//                           className="w-5 h-5 text-amber-600 rounded"
//                         />
//                         <div className="flex-1">
//                           <div className="font-bold text-xl">
//                             {session.table_name.trim()} #{session.table_number}
//                           </div>
//                           <div className="text-sm text-gray-700 mt-1">
//                             {session.guest_count} guest{session.guest_count !== "1" ? "s" : ""} • {session.duration_formatted}
//                           </div>
//                         </div>
//                         <div className="text-right">
//                           <div className="text-2xl font-bold text-amber-900">
//                             Ksh {Number(session.total_amount).toFixed(2)}
//                           </div>
//                           <span className="inline-block mt-2 px-4 py-1 text-sm bg-green-100 text-green-700 rounded-full font-medium">
//                             Active
//                           </span>
//                         </div>
//                       </div>

//                       {expandedSessionId === session.session_id && (
//                         <div className="p-6 bg-gray-50 border-t">
//                           {ordersLoading === session.session_id ? (
//                             <p className="text-center py-8 text-gray-600">Loading orders...</p>
//                           ) : sessionOrdersMap[session.session_id]?.length ? (
//                             <div className="overflow-x-auto">
//                               <table className="w-full text-sm">
//                                 <thead className="bg-gray-200">
//                                   <tr>
//                                     <th className="text-left py-3 px-4">Item</th>
//                                     <th className="text-center py-3 px-4">Qty</th>
//                                     <th className="text-right py-3 px-4">Price</th>
//                                     <th className="text-right py-3 px-4">Total</th>
//                                   </tr>
//                                 </thead>
//                                 <tbody>
//                                   {sessionOrdersMap[session.session_id].map((order, i) => (
//                                     <tr key={i} className="border-b">
//                                       <td className="py-3 px-4">{order.item_description}</td>
//                                       <td className="text-center py-3 px-4">{order.quantity}</td>
//                                       <td className="text-right py-3 px-4">Ksh {Number(order.unit_price).toFixed(2)}</td>
//                                       <td className="text-right py-3 px-4 font-medium">Ksh {Number(order.line_total).toFixed(2)}</td>
//                                     </tr>
//                                   ))}
//                                 </tbody>
//                               </table>
//                             </div>
//                           ) : (
//                             <p className="text-center py-8 text-gray-600">No orders yet</p>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             <div className="p-6 border-t bg-gray-50 flex justify-end gap-4">
//               <button
//                 onClick={() => setShowSessionsModal(false)}
//                 className="px-8 py-3 border border-gray-400 rounded-lg font-medium"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleMergeAndAddToCart}
//                 disabled={selectedCount === 0 || ordersLoading !== null}
//                 className={`px-8 py-3 rounded-lg font-medium ${
//                   selectedCount > 0
//                     ? "bg-amber-700 text-white hover:bg-amber-800"
//                     : "bg-gray-300 text-gray-600 cursor-not-allowed"
//                 }`}
//               >
//                 {selectedCount > 1 ? `Merge ${selectedCount} & Add to Cart` : "Add to Cart"} (+Tax & Tips)
//               </button>
//             </div>
//           </div>
//         </div>
//       )}



//      {mpesaModal && (
//   <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
//     <div className="bg-white w-full max-w-xl h-[80vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
      
//       {/* Header */}
//       <div className="px-6 py-4 border-b flex justify-between items-center">
//         <h3 className="text-lg font-bold">Mpesa Transactions</h3>
//         <button
//           onClick={() => setMpesaModal(false)}
//           className="text-2xl text-gray-500 hover:text-gray-800"
//         >
//           &times;
//         </button>
//       </div>

//       {/* Body */}
//       <div className="flex-1 overflow-y-auto p-6">
//         {mpesaTransactions.length === 0 ? (
//           <p className="text-center text-gray-500 mt-10">
//             No Mpesa transactions
//           </p>
//         ) : (
//           <div className="space-y-3">
//             {mpesaTransactions.map((tx) => (
//               <div
//                 key={tx.Auto}
//                 className="border rounded-lg p-3 flex justify-between items-center"
//                 onClick={()=>{setselectedMpesaTrans(tx)}}
//               >
//                 <div>
//                   <p className="font-semibold">{tx.name}</p>
//                   <p className="text-xs text-gray-500">
//                     Ref: {tx.TransID}
//                   </p>
//                   <p className="text-xs text-gray-500">
//                     {tx.TransTime}
//                   </p>
//                 </div>

//                 <div className="font-bold text-green-700">
//                   Ksh {Number(tx.TransAmount).toLocaleString()}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//     </div>
//   </div>
// )}

//     </>
//   );
// }


// app/payments/page.tsx






import React, { useEffect, useState } from "react";
import {
  GetAllActiveSessions,
  GetPerSessionOrders,
  postCashPayment,
  GetProcessedTransactions,
  LoadMpesaTransactions,
} from "../hooks/access";
import { DiningSessionDTO, OrderDTO, PosPaymentResponse } from "./types";

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

  const [cashAmount, setCashAmount] = useState<number>(0);
  const [cashAmountModal, setCashAmountModal] = useState(false);

  const [clientDetails, setClientDetails] = useState({ name: "", kra: "" });

  const [history, setHistory] = useState<PosPaymentResponse[]>([]);
  const [mpesaTransactions, setMpesaTransactions] = useState<MpesaTransaction[]>([]);
  const [mpesaModal, setMpesaModal] = useState(false);
  const [selectedMpesaTrans, setSelectedMpesaTrans] = useState<MpesaTransaction | null>(null);

  const [cartTransaction, setCartTransaction] = useState<CartTransaction | null>(null);

  const handleClientDetails = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClientDetails(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
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

  // const handlePayment = async () => {
  //   if (!cartTransaction) return;

  //   try {
  //     const itemsForBackend = cartTransaction.orders.map(order => ({
  //       quantity: order.quantity,
  //       item_option: order.item_description,
  //       item_option_id: order.item_code || order.id.toString(),
  //       price: Number(order.unit_price).toFixed(2),
  //       total: Number(order.line_total),
  //     }));

  //     const ordersToClear = cartTransaction.orders.map(order => ({
  //       order_no: order.order_no || "",
  //       trans_type: "30",
  //       reference: order.invoice_ref || `REF_${Date.now()}`,
  //     }));

  //     // Build pospayments array with both CASH and MPESA if used
  //     const pospayments = [];

  //     // Always add CASH entry (even if amount is 0)
  //     pospayments.push({
  //       name: "CASH",
  //       TransID: Date.now().toString(),
  //       TransAmount: cashAmount,
  //       Auto: Date.now().toString(),
  //       TransTime: Date.now().toString(),
  //       MSISDN: "",
  //       Transtype: "CASH",
  //       Cheque: "",
  //       p: "0",
  //     });

  //     // Add M-Pesa if selected
  //     if (selectedMpesaTrans) {
  //       pospayments.push({
  //         name: selectedMpesaTrans.name,
  //         TransID: selectedMpesaTrans.TransID,
  //         TransAmount: selectedMpesaTrans.TransAmount,
  //         Auto: selectedMpesaTrans.Auto,
  //         TransTime: selectedMpesaTrans.TransTime,
  //         MSISDN: "",
  //         Transtype: "MPESA",
  //         Cheque: "",
  //         p: "",
  //       });
  //     }

  //     const response = await postCashPayment({
  //       total: cartTransaction.grandTotal,
  //       items: itemsForBackend,
  //       ordersToClear,
  //       customerName: clientDetails.name || "Walk-in",
  //       customerPin: clientDetails.kra,
  //       pospayments, // <-- This is the key change!
  //     });

  //     if (response?.message === "Success" || response?.status === "SUCCESS") {
  //       alert(`Payment successful! Invoice #${response.invNo || "N/A"}`);
  //       clearCart();
  //     } else {
  //       alert(response?.message || "Payment failed");
  //     }
  //   } catch (err: any) {
  //     alert("Payment error: " + (err.message || "Network issue"));
  //     console.error(err);
  //   }
  // };



  const handlePayment = async () => {
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
      alert(`Payment successful! Invoice #${response.invNo}`);
      clearCart();
    } else {
      alert(response?.message || "Payment failed");
    }
  } catch (err: any) {
    alert("Payment failed: " + (err.message || "Unknown error"));
    console.error(err);
  }
};
  const selectedCount = selectedSessionsInModal.size;

  return (
    <>
      <div className="min-h-screen bg-[#F7F5EE]">
        <div className="p-4 md:p-6 lg:p-8">
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
                <h3 className="font-bold text-lg sticky top-0 bg-[#F7F5EE] py-2">Payment History</h3>
                {history.length === 0 ? (
                  <p className="text-center text-gray-500 text-sm">No payments yet</p>
                ) : (
                  history.map(item => (
                    <div key={item.id} className="bg-white rounded-lg border p-3 shadow-sm">
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold">Inv #{item.invNo}</span>
                        <span className="text-gray-500">{item.pdate}</span>
                      </div>
                      <div className="mt-1 text-sm">
                        <span className="text-gray-600">{item.ptype}</span>
                      </div>
                      <div className="mt-1 font-bold text-amber-900">
                        Ksh {Number(item.ptotal).toFixed(2)}
                      </div>
                    </div>
                  ))
                )}
              </div>
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
                  onClick={handlePayment}
                  disabled={!cartTransaction || balance > 0}
                  className={`w-full py-4 font-bold rounded-lg text-lg transition ${
                    !cartTransaction || balance > 0
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                      : "bg-rose-600 text-white hover:bg-rose-700"
                  }`}
                >
                  Process Payment
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
        </div>
      )}
    </>
  );
}