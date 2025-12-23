"use client";
// import React, { useEffect, useState } from "react";
// import { GetAllActiveSessions,postCashPayment, GetPerSessionOrders } from "../hooks/access";
// import { DiningSessionDTO, OrderDTO } from "./types";

// interface CartTransaction {
//   sessions: DiningSessionDTO[];        // Multiple sessions
//   orders: OrderDTO[];                  // All orders combined
//   tips: number;
//    subtotal: number; 
//   grandTotal: number;
//   displayLabel: string;                // e.g., "Multiple Tables: Table 1, Table 2"
// }

// function Payments() {
//   const [activeSessions, setActiveSessions] = useState<DiningSessionDTO[]>([]);
//   const [selectedSessionsInModal, setSelectedSessionsInModal] = useState<Set<string>>(new Set());
//   const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
//   const [sessionOrdersMap, setSessionOrdersMap] = useState<Record<string, OrderDTO[]>>({});
//   const [ordersLoading, setOrdersLoading] = useState<string | null>(null);
//   const [showSessionsModal, setShowSessionsModal] = useState(false);
// const [cashAmountModal, setcashAmountModal] = useState(false)
//   const [cartTransaction, setCartTransaction] = useState<CartTransaction | null>(null);
// const [cashAmount, setcashAmount] = useState<number>(0)
// const [clientdetails, setclientdetails] = useState({
//   name:"",
//   kra:""
// })
// const handleClientDetails = (
//   e: React.ChangeEvent<HTMLInputElement>
// ) => {
//   const { name, value } = e.target;

//   setclientdetails((prev) => ({
//     ...prev,
//     [name]: value,
//   }));
// };
//   useEffect(() => {
//     const fetchSessions = async () => {
//       try {
//         const res = await GetAllActiveSessions();
//         setActiveSessions(res.sessions);
//       } catch (e) {
//         console.error("Failed to load sessions:", e);
//       }
//     };
//     fetchSessions();
//   }, []);

//   const loadOrdersForSession = async (sessionId: string) => {
//     if (sessionOrdersMap[sessionId]) {
//       setExpandedSessionId(expandedSessionId === sessionId ? null : sessionId);
//       return;
//     }

//     setOrdersLoading(sessionId);
//     try {
//       const res = await GetPerSessionOrders({ session_id: sessionId });
//       setSessionOrdersMap(prev => ({ ...prev, [sessionId]: res.orders }));
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
//       if (newSet.has(sessionId)) {
//         newSet.delete(sessionId);
//       } else {
//         newSet.add(sessionId);
//       }
//       return newSet;
//     });
//   };

//   const handleMergeAndAddToCart = async () => {
//     if (selectedSessionsInModal.size < 1) {
//       alert("Please select at least one session.");
//       return;
//     }

//     // Fetch orders for all selected sessions if not already loaded
//     const sessionsToLoad = activeSessions.filter(s => 
//       selectedSessionsInModal.has(s.session_id) && !sessionOrdersMap[s.session_id]
//     );

//     if (sessionsToLoad.length > 0) {
//       setOrdersLoading("multiple");
//       await Promise.all(
//         sessionsToLoad.map(async (session) => {
//           try {
//             const res = await GetPerSessionOrders({ session_id: session.session_id });
//             setSessionOrdersMap(prev => ({ ...prev, [session.session_id]: res.orders }));
//           } catch (e) {
//             console.error(e);
//             setSessionOrdersMap(prev => ({ ...prev, [session.session_id]: [] }));
//           }
//         })
//       );
//       setOrdersLoading(null);
//     }

//     // Build merged transaction
//     const selectedSessions = activeSessions.filter(s => selectedSessionsInModal.has(s.session_id));
//     const allOrders: OrderDTO[] = selectedSessions.flatMap(s => sessionOrdersMap[s.session_id] || []);

//     if (allOrders.length === 0) {
//       alert("Selected sessions have no orders.");
//       return;
//     }

//     const subtotal = selectedSessions.reduce((sum, s) => sum + Number(s.total_amount), 0);
//     const tips = 200; // Fixed tip for merged bill
//     const grandTotal = subtotal + tips;

//     const tableNames = selectedSessions.map(s => `${s.table_name} #${s.table_number}`).join(", ");
//     const displayLabel = selectedSessions.length === 1 
//       ? `${selectedSessions[0].table_name} #${selectedSessions[0].table_number}`
//       : `Multiple Tables: ${tableNames}`;

//  setCartTransaction({
//   sessions: selectedSessions,
//   orders: allOrders,
//   subtotal,
//   tips,
//   grandTotal,
//   displayLabel,
// });

//     // Reset modal
//     setShowSessionsModal(false);
//     setSelectedSessionsInModal(new Set());
//     setExpandedSessionId(null);
//   };

//   const clearCart = () => {
//     setCartTransaction(null);
//   };

//   const selectedCount = selectedSessionsInModal.size;
// const balance =
//   cartTransaction
//     ? Number(cartTransaction.grandTotal) - Number(cashAmount || 0)
//     : 0;
// const handlePayment =async(  customerName: string,
//   kraPin: string,
//   amountDue: string,
//   orders: OrderDTO[]
// )=>{
//   const res = await postCashPayment({total:amountDue,paymentRecord.TransAmount:amountDue,posdescItems:orders,customerName:customerName,customerPin:kraPin})
// }

//   return (
//     <>
//       <div className="bg-[#F7F5EE]">
//         <div className="p-4 md:p-6 lg:p-8">
//           <div className="grid grid-cols-1 md:grid-cols-8 lg:grid-cols-12 gap-6">
//             {/* Left: Current Transaction */}
//             <div className="md:col-span-2 border-r border-black/20 pr-3 space-y-6">
//               <input
//                 type="text"
//                 placeholder="Search Transaction"
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
//               />
//               <h3 className="font-semibold text-lg">Transaction History</h3>

//               <button
//                 onClick={() => setShowSessionsModal(true)}
//                 className="w-full py-3 bg-amber-700 text-white font-medium rounded-lg hover:bg-amber-800 transition"
//               >
//                 Load Active Sessions
//               </button>

//               <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//                 <div className="bg-gray-50 px-4 py-3 border-b">
//                   <h4 className="font-semibold">Current Transaction</h4>
//                   {cartTransaction && (
//                     <p className="text-sm text-gray-600 mt-1">{cartTransaction.displayLabel}</p>
//                   )}
//                 </div>
//                 <table className="w-full text-sm">
                
//                   <tbody>
//                     {cartTransaction ? (
//                       <>
                       
//                         <tr className="bg-amber-50 font-semibold">
//                           <td colSpan={2} className="px-4 py-3 text-right">Tips</td>
//                           <td className="px-4 py-3 text-right">Ksh 200.00</td>
//                         </tr>
//                         <tr className="bg-amber-100 font-bold text-lg">
//                           <td colSpan={2} className="px-4 py-3 text-right">Grand Total</td>
//                           <td className="px-4 py-3 text-right text-amber-900">
//                             Ksh {cartTransaction.grandTotal.toFixed(2)}
//                           </td>
//                         </tr>
//                       </>
//                     ) : (
//                       <tr>
//                         <td colSpan={3} className="text-center py-16 text-gray-500">
//                           No transaction added yet
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>

//             {/* Center: Merged Transaction Details */}
//             <div className="md:col-span-6 lg:col-span-7">
//               {cartTransaction ? (
//                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
//                   <div className="flex justify-between items-center mb-6">
//                     <div>
//                       <h2 className="text-2xl font-bold">{cartTransaction.displayLabel}</h2>
//                       <p className="text-gray-600">
//                         {cartTransaction.sessions.length} table{cartTransaction.sessions.length > 1 ? 's' : ''} • 
//                         Total guests: {cartTransaction.sessions.reduce((sum, s) => sum + s.guest_count, 0)}
//                       </p>
//                     </div>
//                     <div className="text-right">
//                       <p className="text-3xl font-bold text-amber-900">
//                         Ksh {cartTransaction.grandTotal.toFixed(2)}
//                       </p>
//                       <span className="inline-block mt-2 px-4 py-1 text-sm bg-green-100 text-green-700 rounded-full font-medium">
//                         Ready for Payment
//                       </span>
//                     </div>
//                   </div>

//                   <div className="overflow-x-auto">
//                     <table className="w-full text-sm border rounded-lg">
//                       <thead className="bg-gray-100">
//                         <tr>
//                           <th className="px-4 py-3 text-left">Item</th>
//                           <th className="px-4 py-3 text-center">Qty</th>
//                           <th className="px-4 py-3 text-right">Price</th>
//                           <th className="px-4 py-3 text-right">Total</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {cartTransaction.orders.map((order, idx) => (
//                           <tr key={`${order.id}-${idx}`} className="border-t">
//                             <td className="px-4 py-3">{order.item_description}</td>
//                             <td className="px-4 py-3 text-center">{order.quantity}</td>
//                             <td className="px-4 py-3 text-right">
//                               Ksh {Number(order.unit_price).toFixed(2)}
//                             </td>
//                             <td className="px-4 py-3 text-right font-semibold">
//                               Ksh {Number(order.line_total).toFixed(2)}
//                             </td>
//                           </tr>
//                         ))}
//                         <tr className="bg-amber-50 font-bold">
//                           <td colSpan={3} className="px-4 py-3 text-right">Tips</td>
//                           <td className="px-4 py-3 text-right">Ksh 200.00</td>
//                         </tr>
//                       </tbody>
//                     </table>
//                   </div>

//                   <button
//                     onClick={clearCart}
//                     className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
//                   >
//                     Clear Transaction
//                   </button>
//                 </div>
//               ) : (
//                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center text-gray-500 min-h-96 flex flex-col items-center justify-center">
//                   <h3 className="text-2xl font-medium mb-4">No Transaction Selected</h3>
//                   <p>Open active sessions and merge tables for combined payment.</p>
//                 </div>
//               )}
//             </div>

//             {/* Right: Payment Panel */}
//             <div className="md:col-span-8 md:col-start-1 lg:col-span-3 lg:col-start-auto space-y-6">
//               <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//                 <h3 className="font-semibold text-lg mb-4">Customer Details</h3>
//                 <input type="text" value={clientdetails.name} onChange={handleClientDetails} placeholder="Name" className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-amber-600" />
//                 <input type="text" value={clientdetails.kra} onChange={handleClientDetails} placeholder="KRA Pin" className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-amber-600" />

                
//                 <button
//   type="button"
//   disabled={balance <= 0}
//   onClick={() =>
//   handlePayment(
//     clientdetails.name,
//     clientdetails.kra,
//     cartTransaction.grandTotal.toFixed(2),
//     cartTransaction.orders
//   )
// }

//   className={`w-full py-2 font-bold rounded-lg transition text-sm
//     ${balance <= 0
//       ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//       : "bg-rose-600 text-white hover:bg-rose-700"
//     }`}
// >
//   Process Payment
// </button>


//                 <div className="mt-2 space-y-2 text-sm">
//                   <div className="flex justify-between">
//                     <span>Subtotal</span>
//                     <span className="font-bold">
//                       Ksh {cartTransaction ? (cartTransaction.grandTotal - 200).toFixed(2) : "0.00"}
//                     </span>
//                   </div>
//                   <div className="flex justify-between text-amber-700">
//                     <span>Tips</span>
//                     <span className="font-bold">Ksh {cartTransaction ? "200.00" : "0.00"}</span>
//                   </div>
//                   <div className="flex justify-between text-lg font-extrabold border-t pt-4 border-gray-300">
//                     <span>Total Due</span>
//                     <span className="text-amber-900">
//                       Ksh {cartTransaction ? cartTransaction.grandTotal.toFixed(2) : "0.00"}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span>Paid</span>
//                     <span className="font-bold">{0.00 || cashAmount}</span>
//                   </div>
//                   <div className="flex justify-between text-rose-600 font-bold">
//                     <span>Balance</span>
//                     <span>Ksh {cartTransaction ? (cartTransaction.grandTotal - cashAmount||0).toFixed(2) : "0.00"}</span>
//                   </div>
//                 </div>
//               </div>

//               {/* Payment Methods */}
//               <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
//                 <p className="font-medium mb-2">Customer Type</p>
//                 <input type="text" placeholder="Cash Sale" className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2" />

//                 <p className="font-medium mb-3">Payment Method</p>
//                 <div className="grid grid-cols-1 gap-3">
                 
//                   <button className="text-left px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium" onClick={()=>setcashAmountModal(true)}>Cash {
//                     cashAmountModal && (
//                       <div>
//                        <input type="number" value={cashAmount} onChange={(e) => setcashAmount(Number(e.target.value))} className="px-2 w-full py-1 border border-black/30 " placeholder="Enter Amount to pay with cash" min={0}/>
//                       </div>
//                     )
//                     }</button>
//                      {[ "Mpesa", "Family Bank", "Manual Bank"].map((method) => (
//                     <button key={method} className="text-left px-5 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium">
//                       {method}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Active Sessions Modal with Merge Feature */}
//       {showSessionsModal && (
//         <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col">
//             <div className="flex justify-between items-center p-6 border-b bg-gray-50">
//               <div>
//                 <h2 className="text-2xl font-bold">Active Dining Sessions</h2>
//                 {selectedCount > 0 && (
//                   <p className="text-sm text-amber-700 mt-1">{selectedCount} session{selectedCount > 1 ? 's' : ''} selected</p>
//                 )}
//               </div>
//               <button
//                 onClick={() => {
//                   setShowSessionsModal(false);
//                   setSelectedSessionsInModal(new Set());
//                   setExpandedSessionId(null);
//                 }}
//                 className="text-4xl text-gray-500 hover:text-gray-800"
//               >
//                 &times;
//               </button>
//             </div>

//             <div className="overflow-y-auto flex-1 p-6">
//               {activeSessions.length === 0 ? (
//                 <div className="text-center py-20 text-gray-500">
//                   <p className="text-xl">No active sessions currently</p>
//                 </div>
//               ) : (
//                 <div className="space-y-6">
//                   {activeSessions.map((session) => (
//                     <div
//                       key={session.session_id}
//                       className={`border-2 rounded-xl overflow-hidden transition-all bg-white ${
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
//                           onClick={(e) => e.stopPropagation()}
//                           className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
//                         />
//                         <div className="flex-1">
//                           <div className="font-bold text-xl">
//                             {session.table_name} #{session.table_number}
//                           </div>
//                           <div className="text-sm text-gray-700 mt-1">
//                             {session.guest_count} guests • {session.duration_formatted}
//                           </div>
//                         </div>
//                         <div className="text-right">
                          
//                           <span className="inline-block mt-2 px-4 py-1 text-sm bg-green-100 text-green-700 rounded-full font-medium">
//                             Active
//                           </span>
//                         </div>
//                       </div>

//                       {expandedSessionId === session.session_id && (
//                         <div className="p-6 bg-gray-50 border-t max-h-96 overflow-y-auto">
//                           {ordersLoading === session.session_id ? (
//                             <p className="text-center text-gray-600 py-10">Loading orders...</p>
//                           ) : (sessionOrdersMap[session.session_id]?.length || 0) === 0 ? (
//                             <p className="text-center text-gray-600 py-10">No orders yet</p>
//                           ) : (
//                             <>
//                               <div className="overflow-x-auto mb-4">
//                                 <table className="w-full text-sm">
//                                   <thead className="bg-gray-200">
//                                     <tr>
//                                       <th className="text-left py-3 px-4">Item</th>
//                                       <th className="text-center py-3 px-4">Qty</th>
//                                       <th className="text-right py-3 px-4">Price</th>
//                                       <th className="text-right py-3 px-4">Total</th>
//                                     </tr>
//                                   </thead>
//                                   <tbody>
//                                     {sessionOrdersMap[session.session_id].map((order) => (
//                                       <tr key={order.id} className="border-b">
//                                         <td className="py-3 px-4">{order.item_description}</td>
//                                         <td className="text-center py-3 px-4">{order.quantity}</td>
//                                         <td className="text-right py-3 px-4">
//                                           Ksh {Number(order.unit_price).toFixed(2)}
//                                         </td>
//                                         <td className="text-right py-3 px-4 font-medium">
//                                           Ksh {Number(order.line_total).toFixed(2)}
//                                         </td>
//                                       </tr>
//                                     ))}
//                                   </tbody>
//                                 </table>
//                               </div>
//                         <span>Subtotal</span>
// <span className="font-bold">
//   Ksh {cartTransaction?.subtotal.toFixed(2) ?? "0.00"}
// </span>


//                             </>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             <div className="p-6 border-t bg-gray-50 flex justify-between items-center gap-4">
//               <button
//                 onClick={() => {
//                   setShowSessionsModal(false);
//                   setSelectedSessionsInModal(new Set());
//                   setExpandedSessionId(null);
//                 }}
//                 className="px-8 py-3 border border-gray-400 rounded-lg hover:bg-gray-100 font-medium"
//               >
//                 Cancel
//               </button>

//               <div className="flex gap-3">
//                 {selectedCount === 1 && (
//                   <button
//                     onClick={handleMergeAndAddToCart}
//                     className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
//                   >
//                     Add Single to Cart
//                   </button>
//                 )}
//                 <button
//                   onClick={handleMergeAndAddToCart}
//                   disabled={selectedCount === 0 || ordersLoading !== null}
//                   className={`px-8 py-3 rounded-lg font-medium transition ${
//                     selectedCount >= 2
//                       ? "bg-amber-700 text-white hover:bg-amber-800"
//                       : "bg-gray-300 text-gray-600 cursor-not-allowed"
//                   }`}
//                 >
//                   {selectedCount >= 2 
//                     ? `Merge ${selectedCount} & Add (+Ksh 200 Tips)`
//                     : "Select tables to merge"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

// export default Payments;





// app/payments/page.tsx  (or wherever your Payments page is)

"use client";

import React, { useEffect, useState } from "react";
import {
  GetAllActiveSessions,
  GetPerSessionOrders,
  postCashPayment,GetProcessedTransactions } from "../hooks/access"
import { DiningSessionDTO, OrderDTO, PosPaymentResponse } from "./types"; // Adjust if needed

interface CartTransaction {
  sessions: DiningSessionDTO[];
  orders: OrderDTO[];
  subtotal: number;
  tax: number; // 4.78%
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
const [history, sethistory] = useState<PosPaymentResponse[]>([])
  const [clientDetails, setClientDetails] = useState({ name: "", kra: "" });

  const [cartTransaction, setCartTransaction] = useState<CartTransaction | null>(null);

  const handleClientDetails = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClientDetails(prev => ({ ...prev, [name]: value }));
  };

  // Load active sessions on mount
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await GetAllActiveSessions();
        if (res.status === "SUCCESS" && Array.isArray(res.sessions)) {
          setActiveSessions(res.sessions);
        }
      } catch (e) {
        console.error("Failed to load sessions:", e);
      }
    };

    const fetchProcessedTransactions = async ()=>{
      try{
const res = await GetProcessedTransactions()
console.log("pppoiui",res);

sethistory(res ??[])
      }
catch (e) {
        console.error("Failed to load sessions:", e);
      }
    }
    fetchSessions();
    fetchProcessedTransactions()
  }, []);

  // Expand/collapse and load orders
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
      setSessionOrdersMap(prev => ({ ...prev, [sessionId]: [] }));
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

  // Add selected (or merged) sessions to cart
  const handleMergeAndAddToCart = async () => {
    if (selectedSessionsInModal.size === 0) {
      alert("Please select at least one session.");
      return;
    }

    const sessionsToLoad = activeSessions.filter(
      s => selectedSessionsInModal.has(s.session_id) && !sessionOrdersMap[s.session_id]
    );

    if (sessionsToLoad.length > 0) {
      setOrdersLoading("multiple");
      await Promise.all(
        sessionsToLoad.map(async s => {
          try {
            const res = await GetPerSessionOrders({ session_id: s.session_id });
            if (res.status === "SUCCESS") {
              setSessionOrdersMap(prev => ({ ...prev, [s.session_id]: res.orders || [] }));
            }
          } catch (e) {
            console.error(e);
          }
        })
      );
      setOrdersLoading(null);
    }

    const selectedSessions = activeSessions.filter(s => selectedSessionsInModal.has(s.session_id));
    const allOrders = selectedSessions.flatMap(s => sessionOrdersMap[s.session_id] || []);

    if (allOrders.length === 0) {
      alert("Selected sessions have no orders yet.");
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
  };

  const balance = cartTransaction ? cartTransaction.grandTotal - cashAmount : 0;

  const handlePayment = async () => {
    if (!cartTransaction) return;

    try {
      const itemsForBackend = cartTransaction.orders.map(order => ({
        quantity: order.quantity,
        item_option: order.item_description,
        item_option_id: order.item_code || order.id.toString(),
        price: Number(order.unit_price).toFixed(2),
        total: Number(order.line_total),
      }));

      const ordersToClear = cartTransaction.orders.map(order => ({
        order_no: order.order_no || "",
        trans_type: "30",
        reference: order.invoice_ref || `REF_${Date.now()}`,
      }));

      const response = await postCashPayment({
        total: cartTransaction.grandTotal,
        items: itemsForBackend,
        ordersToClear,
        customerName: clientDetails.name,
        customerPin: clientDetails.kra,
      });

      if (response?.status === "SUCCESS") {
        alert("Payment processed successfully!");
        clearCart();
      } else {
        alert(response?.message || "Payment failed");
      }
    } catch (err: any) {
      alert("Error: " + (err.message || "Unknown"));
      console.error(err);
    }
  };

  const selectedCount = selectedSessionsInModal.size;

  return (
    <>
      <div className="bg-[#F7F5EE]">
        <div className="p-4 md:p-6 lg:p-6">
          <div className="grid grid-cols-1 md:grid-cols-8 lg:grid-cols-12 gap-6">
            {/* Left Panel */}
            <div className="md:col-span-2 space-y-6 border-r border-black/30 pr-2">
              <button
                onClick={() => setShowSessionsModal(true)}
                className="w-full py-4 bg-amber-700 text-white font-bold rounded-lg hover:bg-amber-800 transition flex items-center justify-center gap-3"
              >
                Load Active Sessions
              </button>

               {history.length === 0 ? (
    <p className="text-sm text-gray-500 text-center">
      No payment history
    </p>
  ) : (
    history.map((item) => (
      <div
        key={item.id}
        className="bg-white border border-gray-200 rounded-lg p-3 hover:bg-amber-50 cursor-pointer transition"
      >
        <div className="flex justify-between items-center">
          <span className="font-bold text-sm">
            Invoice #{item.invNo}
          </span>
          <span className="text-xs text-gray-500">
            {item.pdate}
          </span>
        </div>

        <div className="flex justify-between mt-2 text-sm">
          <span className="text-gray-700">
            {item.ptype}
          </span>
          <span className="font-bold text-amber-900">
            Ksh {Number(item.ptotal).toFixed(2)}
          </span>
        </div>

        <div className="text-xs text-gray-500 mt-1">
          Order #{item.order_no}
        </div>
      </div>
    ))
  )}

           
            </div>

            {/* Center Panel */}
            <div className="md:col-span-6 lg:col-span-7">
              {cartTransaction ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold">{cartTransaction.displayLabel}</h2>
                      <p className="text-gray-600 mt-1">
                        {cartTransaction.sessions.length} table(s) • {cartTransaction.orders.length} item(s)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-amber-900">
                        Ksh {cartTransaction.grandTotal.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left">Item</th>
                          <th className="px-4 py-3 text-center">Qty</th>
                          <th className="px-4 py-3 text-right">Price</th>
                          <th className="px-4 py-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cartTransaction.orders.map((order, i) => (
                          <tr key={i} className="border-t">
                            <td className="px-4 py-3">{order.item_description}</td>
                            <td className="px-4 py-3 text-center">{order.quantity}</td>
                            <td className="px-4 py-3 text-right">Ksh {Number(order.unit_price).toFixed(2)}</td>
                            <td className="px-4 py-3 text-right font-semibold">Ksh {Number(order.line_total).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 text-right space-y-2 text-lg">
                    <div>Subtotal: <strong>Ksh {cartTransaction.subtotal.toFixed(2)}</strong></div>
                    <div>Tax (4.78%): <strong>Ksh {cartTransaction.tax.toFixed(2)}</strong></div>
                    <div className="text-amber-700">Tips: <strong>Ksh 200.00</strong></div>
                    <div className="text-2xl font-bold text-amber-900">
                      Grand Total: Ksh {cartTransaction.grandTotal.toFixed(2)}
                    </div>
                  </div>

                  <button onClick={clearCart} className="mt-8 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    Clear Transaction
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-500">
                  <h3 className="text-2xl font-medium mb-4">No Transaction Loaded</h3>
                  <p>Click "Load Active Sessions" and select tables to begin payment.</p>
                </div>
              )}
            </div>

            {/* Right Panel */}
            <div className="md:col-span-8 md:col-start-1 lg:col-span-3 lg:col-start-auto space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-lg mb-4">Customer Details</h3>
                <input
                  name="name"
                  value={clientDetails.name}
                  onChange={handleClientDetails}
                  placeholder="Customer Name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3"
                />
                <input
                  name="kra"
                  value={clientDetails.kra}
                  onChange={handleClientDetails}
                  placeholder="KRA Pin (Optional)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-6"
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

                <div className="mt-8 space-y-4 text-lg">
                  <div className="flex justify-between">
                    <span>Total Due</span>
                    <span className="font-bold text-amber-900">
                      Ksh {cartTransaction?.grandTotal.toFixed(2) || "0.00"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cash Tendered</span>
                    <span className="font-bold">Ksh {cashAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold border-t pt-4">
                    <span>Balance / Change</span>
                    <span className={balance > 0 ? "text-red-600" : "text-green-600"}>
                      Ksh {balance.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <p className="font-bold mb-4">Payment Method</p>
                <button
                  onClick={() => setCashAmountModal(true)}
                  className="w-full text-left px-5 py-4 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium mb-3"
                >
                  Cash
                </button>
                {["Mpesa", "Family Bank", "Manual Bank"].map(m => (
                  <button key={m} className="w-full text-left px-5 py-4 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium mb-2">
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cash Amount Modal */}
      {cashAmountModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-6">Enter Cash Amount</h3>
            <input
              type="number"
              value={cashAmount}
              onChange={e => setCashAmount(Number(e.target.value) || 0)}
              className="w-full px-6 py-5 text-3xl border-2 border-gray-400 rounded-xl text-center font-medium"
              placeholder="0.00"
              min="0"
              step="10"
            />
            <div className="grid grid-cols-2 gap-4 mt-8">
              <button
                onClick={() => {
                  setCashAmountModal(false);
                  setCashAmount(0);
                }}
                className="py-3 border border-gray-400 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => setCashAmountModal(false)}
                className="py-3 bg-amber-700 text-white rounded-lg font-medium"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Sessions Modal */}
      {showSessionsModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b bg-gray-50">
              <div>
                <h2 className="text-2xl font-bold">Active Dining Sessions ({activeSessions.length})</h2>
                {selectedCount > 0 && (
                  <p className="text-sm text-amber-700 mt-1">{selectedCount} selected</p>
                )}
              </div>
              <button onClick={() => setShowSessionsModal(false)} className="text-4xl text-gray-500 hover:text-gray-800">
                ×
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6">
              {activeSessions.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  <p className="text-xl">No active sessions found</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {activeSessions.map(session => (
                    <div
                      key={session.session_id}
                      className={`border-2 rounded-xl overflow-hidden transition-all ${
                        selectedSessionsInModal.has(session.session_id)
                          ? "border-amber-500 shadow-lg ring-2 ring-amber-200"
                          : "border-gray-200"
                      }`}
                    >
                      <div
                        className="p-5 bg-gradient-to-r from-amber-50 to-amber-100 cursor-pointer flex items-center gap-4"
                        onClick={() => loadOrdersForSession(session.session_id)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedSessionsInModal.has(session.session_id)}
                          onChange={() => toggleSessionSelection(session.session_id)}
                          onClick={e => e.stopPropagation()}
                          className="w-5 h-5 text-amber-600 rounded"
                        />
                        <div className="flex-1">
                          <div className="font-bold text-xl">
                            {session.table_name.trim()} #{session.table_number}
                          </div>
                          <div className="text-sm text-gray-700 mt-1">
                            {session.guest_count} guest{session.guest_count !== "1" ? "s" : ""} • {session.duration_formatted}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-amber-900">
                            Ksh {Number(session.total_amount).toFixed(2)}
                          </div>
                          <span className="inline-block mt-2 px-4 py-1 text-sm bg-green-100 text-green-700 rounded-full font-medium">
                            Active
                          </span>
                        </div>
                      </div>

                      {expandedSessionId === session.session_id && (
                        <div className="p-6 bg-gray-50 border-t">
                          {ordersLoading === session.session_id ? (
                            <p className="text-center py-8 text-gray-600">Loading orders...</p>
                          ) : sessionOrdersMap[session.session_id]?.length ? (
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead className="bg-gray-200">
                                  <tr>
                                    <th className="text-left py-3 px-4">Item</th>
                                    <th className="text-center py-3 px-4">Qty</th>
                                    <th className="text-right py-3 px-4">Price</th>
                                    <th className="text-right py-3 px-4">Total</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {sessionOrdersMap[session.session_id].map((order, i) => (
                                    <tr key={i} className="border-b">
                                      <td className="py-3 px-4">{order.item_description}</td>
                                      <td className="text-center py-3 px-4">{order.quantity}</td>
                                      <td className="text-right py-3 px-4">Ksh {Number(order.unit_price).toFixed(2)}</td>
                                      <td className="text-right py-3 px-4 font-medium">Ksh {Number(order.line_total).toFixed(2)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-center py-8 text-gray-600">No orders yet</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-4">
              <button
                onClick={() => setShowSessionsModal(false)}
                className="px-8 py-3 border border-gray-400 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleMergeAndAddToCart}
                disabled={selectedCount === 0 || ordersLoading !== null}
                className={`px-8 py-3 rounded-lg font-medium ${
                  selectedCount > 0
                    ? "bg-amber-700 text-white hover:bg-amber-800"
                    : "bg-gray-300 text-gray-600 cursor-not-allowed"
                }`}
              >
                {selectedCount > 1 ? `Merge ${selectedCount} & Add to Cart` : "Add to Cart"} (+Tax & Tips)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}