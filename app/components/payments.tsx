"use client";
import React, { useEffect, useState } from "react";
import { GetAllActiveSessions, GetPerSessionOrders } from "../hooks/access";
import { DiningSessionDTO, OrderDTO } from "./types";

interface CartTransaction {
  sessions: DiningSessionDTO[];        // Multiple sessions
  orders: OrderDTO[];                  // All orders combined
  tips: number;
  grandTotal: number;
  displayLabel: string;                // e.g., "Multiple Tables: Table 1, Table 2"
}

function Payments() {
  const [activeSessions, setActiveSessions] = useState<DiningSessionDTO[]>([]);
  const [selectedSessionsInModal, setSelectedSessionsInModal] = useState<Set<string>>(new Set());
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [sessionOrdersMap, setSessionOrdersMap] = useState<Record<string, OrderDTO[]>>({});
  const [ordersLoading, setOrdersLoading] = useState<string | null>(null);
  const [showSessionsModal, setShowSessionsModal] = useState(false);

  const [cartTransaction, setCartTransaction] = useState<CartTransaction | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await GetAllActiveSessions();
        setActiveSessions(res.sessions);
      } catch (e) {
        console.error("Failed to load sessions:", e);
      }
    };
    fetchSessions();
  }, []);

  const loadOrdersForSession = async (sessionId: string) => {
    if (sessionOrdersMap[sessionId]) {
      setExpandedSessionId(expandedSessionId === sessionId ? null : sessionId);
      return;
    }

    setOrdersLoading(sessionId);
    try {
      const res = await GetPerSessionOrders({ session_id: sessionId });
      setSessionOrdersMap(prev => ({ ...prev, [sessionId]: res.orders }));
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
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  };

  const handleMergeAndAddToCart = async () => {
    if (selectedSessionsInModal.size < 1) {
      alert("Please select at least one session.");
      return;
    }

    // Fetch orders for all selected sessions if not already loaded
    const sessionsToLoad = activeSessions.filter(s => 
      selectedSessionsInModal.has(s.session_id) && !sessionOrdersMap[s.session_id]
    );

    if (sessionsToLoad.length > 0) {
      setOrdersLoading("multiple");
      await Promise.all(
        sessionsToLoad.map(async (session) => {
          try {
            const res = await GetPerSessionOrders({ session_id: session.session_id });
            setSessionOrdersMap(prev => ({ ...prev, [session.session_id]: res.orders }));
          } catch (e) {
            console.error(e);
            setSessionOrdersMap(prev => ({ ...prev, [session.session_id]: [] }));
          }
        })
      );
      setOrdersLoading(null);
    }

    // Build merged transaction
    const selectedSessions = activeSessions.filter(s => selectedSessionsInModal.has(s.session_id));
    const allOrders: OrderDTO[] = selectedSessions.flatMap(s => sessionOrdersMap[s.session_id] || []);

    if (allOrders.length === 0) {
      alert("Selected sessions have no orders.");
      return;
    }

    const subtotal = selectedSessions.reduce((sum, s) => sum + Number(s.total_amount), 0);
    const tips = 200; // Fixed tip for merged bill
    const grandTotal = subtotal + tips;

    const tableNames = selectedSessions.map(s => `${s.table_name} #${s.table_number}`).join(", ");
    const displayLabel = selectedSessions.length === 1 
      ? `${selectedSessions[0].table_name} #${selectedSessions[0].table_number}`
      : `Multiple Tables: ${tableNames}`;

    setCartTransaction({
      sessions: selectedSessions,
      orders: allOrders,
      tips,
      grandTotal,
      displayLabel,
    });

    // Reset modal
    setShowSessionsModal(false);
    setSelectedSessionsInModal(new Set());
    setExpandedSessionId(null);
  };

  const clearCart = () => {
    setCartTransaction(null);
  };

  const selectedCount = selectedSessionsInModal.size;

  return (
    <>
      <div className="min-h-screen bg-[#F7F5EE]">
        <div className="p-4 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-8 lg:grid-cols-12 gap-6">
            {/* Left: Current Transaction */}
            <div className="md:col-span-2 space-y-6">
              <input
                type="text"
                placeholder="Search Transaction"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
              <h3 className="font-semibold text-lg">Transaction History</h3>

              <button
                onClick={() => setShowSessionsModal(true)}
                className="w-full py-3 bg-amber-700 text-white font-medium rounded-lg hover:bg-amber-800 transition"
              >
                Load Active Sessions
              </button>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b">
                  <h4 className="font-semibold">Current Transaction</h4>
                  {cartTransaction && (
                    <p className="text-sm text-gray-600 mt-1">{cartTransaction.displayLabel}</p>
                  )}
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left">Product</th>
                      <th className="px-4 py-3 text-center">Qty</th>
                      <th className="px-4 py-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartTransaction ? (
                      <>
                        {cartTransaction.orders.map((order, idx) => (
                          <tr key={`${order.id}-${idx}`} className="border-b">
                            <td className="px-4 py-3">{order.item_description}</td>
                            <td className="px-4 py-3 text-center">{order.quantity}</td>
                            <td className="px-4 py-3 text-right font-medium">
                              Ksh {Number(order.line_total).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-amber-50 font-semibold">
                          <td colSpan={2} className="px-4 py-3 text-right">Tips</td>
                          <td className="px-4 py-3 text-right">Ksh 200.00</td>
                        </tr>
                        <tr className="bg-amber-100 font-bold text-lg">
                          <td colSpan={2} className="px-4 py-3 text-right">Grand Total</td>
                          <td className="px-4 py-3 text-right text-amber-900">
                            Ksh {cartTransaction.grandTotal.toFixed(2)}
                          </td>
                        </tr>
                      </>
                    ) : (
                      <tr>
                        <td colSpan={3} className="text-center py-16 text-gray-500">
                          No transaction added yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Center: Merged Transaction Details */}
            <div className="md:col-span-6 lg:col-span-7">
              {cartTransaction ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-2xl font-bold">{cartTransaction.displayLabel}</h2>
                      <p className="text-gray-600">
                        {cartTransaction.sessions.length} table{cartTransaction.sessions.length > 1 ? 's' : ''} • 
                        Total guests: {cartTransaction.sessions.reduce((sum, s) => sum + s.guest_count, 0)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-amber-900">
                        Ksh {cartTransaction.grandTotal.toFixed(2)}
                      </p>
                      <span className="inline-block mt-2 px-4 py-1 text-sm bg-green-100 text-green-700 rounded-full font-medium">
                        Ready for Payment
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border rounded-lg">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left">Item</th>
                          <th className="px-4 py-3 text-center">Qty</th>
                          <th className="px-4 py-3 text-right">Price</th>
                          <th className="px-4 py-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cartTransaction.orders.map((order, idx) => (
                          <tr key={`${order.id}-${idx}`} className="border-t">
                            <td className="px-4 py-3">{order.item_description}</td>
                            <td className="px-4 py-3 text-center">{order.quantity}</td>
                            <td className="px-4 py-3 text-right">
                              Ksh {Number(order.unit_price).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold">
                              Ksh {Number(order.line_total).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-amber-50 font-bold">
                          <td colSpan={3} className="px-4 py-3 text-right">Tips</td>
                          <td className="px-4 py-3 text-right">Ksh 200.00</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <button
                    onClick={clearCart}
                    className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Clear Transaction
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center text-gray-500 min-h-96 flex flex-col items-center justify-center">
                  <h3 className="text-2xl font-medium mb-4">No Transaction Selected</h3>
                  <p>Open active sessions and merge tables for combined payment.</p>
                </div>
              )}
            </div>

            {/* Right: Payment Panel */}
            <div className="md:col-span-8 md:col-start-1 lg:col-span-3 lg:col-start-auto space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-lg mb-4">Customer Details</h3>
                <input type="text" placeholder="Name" className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-amber-600" />
                <input type="text" placeholder="KRA Pin" className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-amber-600" />

                <button className="w-full py-4 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 transition text-lg">
                  Process Payment
                </button>

                <div className="mt-8 space-y-4 text-lg">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold">
                      Ksh {cartTransaction ? (cartTransaction.grandTotal - 200).toFixed(2) : "0.00"}
                    </span>
                  </div>
                  <div className="flex justify-between text-amber-700">
                    <span>Tips</span>
                    <span className="font-bold">Ksh {cartTransaction ? "200.00" : "0.00"}</span>
                  </div>
                  <div className="flex justify-between text-xl font-extrabold border-t pt-4 border-gray-300">
                    <span>Total Due</span>
                    <span className="text-amber-900">
                      Ksh {cartTransaction ? cartTransaction.grandTotal.toFixed(2) : "0.00"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Paid</span>
                    <span className="font-bold">Ksh 0.00</span>
                  </div>
                  <div className="flex justify-between text-rose-600 font-bold">
                    <span>Balance</span>
                    <span>Ksh {cartTransaction ? cartTransaction.grandTotal.toFixed(2) : "0.00"}</span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <p className="font-medium mb-3">Customer Type</p>
                <input type="text" placeholder="Cash Sale" className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4" />

                <p className="font-medium mb-3">Payment Method</p>
                <div className="grid grid-cols-1 gap-3">
                  {["Cash", "Mpesa", "Family Bank", "Manual Bank"].map((method) => (
                    <button key={method} className="text-left px-5 py-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium">
                      {method}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Sessions Modal with Merge Feature */}
      {showSessionsModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b bg-gray-50">
              <div>
                <h2 className="text-2xl font-bold">Active Dining Sessions</h2>
                {selectedCount > 0 && (
                  <p className="text-sm text-amber-700 mt-1">{selectedCount} session{selectedCount > 1 ? 's' : ''} selected</p>
                )}
              </div>
              <button
                onClick={() => {
                  setShowSessionsModal(false);
                  setSelectedSessionsInModal(new Set());
                  setExpandedSessionId(null);
                }}
                className="text-4xl text-gray-500 hover:text-gray-800"
              >
                &times;
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6">
              {activeSessions.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  <p className="text-xl">No active sessions currently</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {activeSessions.map((session) => (
                    <div
                      key={session.session_id}
                      className={`border-2 rounded-xl overflow-hidden transition-all bg-white ${
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
                          onClick={(e) => e.stopPropagation()}
                          className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
                        />
                        <div className="flex-1">
                          <div className="font-bold text-xl">
                            {session.table_name} #{session.table_number}
                          </div>
                          <div className="text-sm text-gray-700 mt-1">
                            {session.guest_count} guests • {session.duration_formatted}
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
                        <div className="p-6 bg-gray-50 border-t max-h-96 overflow-y-auto">
                          {ordersLoading === session.session_id ? (
                            <p className="text-center text-gray-600 py-10">Loading orders...</p>
                          ) : (sessionOrdersMap[session.session_id]?.length || 0) === 0 ? (
                            <p className="text-center text-gray-600 py-10">No orders yet</p>
                          ) : (
                            <>
                              <div className="overflow-x-auto mb-4">
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
                                    {sessionOrdersMap[session.session_id].map((order) => (
                                      <tr key={order.id} className="border-b">
                                        <td className="py-3 px-4">{order.item_description}</td>
                                        <td className="text-center py-3 px-4">{order.quantity}</td>
                                        <td className="text-right py-3 px-4">
                                          Ksh {Number(order.unit_price).toFixed(2)}
                                        </td>
                                        <td className="text-right py-3 px-4 font-medium">
                                          Ksh {Number(order.line_total).toFixed(2)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                              <div className="text-right text-lg font-bold text-amber-900">
                                Subtotal: Ksh {Number(session.total_amount).toFixed(2)}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-between items-center gap-4">
              <button
                onClick={() => {
                  setShowSessionsModal(false);
                  setSelectedSessionsInModal(new Set());
                  setExpandedSessionId(null);
                }}
                className="px-8 py-3 border border-gray-400 rounded-lg hover:bg-gray-100 font-medium"
              >
                Cancel
              </button>

              <div className="flex gap-3">
                {selectedCount === 1 && (
                  <button
                    onClick={handleMergeAndAddToCart}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Add Single to Cart
                  </button>
                )}
                <button
                  onClick={handleMergeAndAddToCart}
                  disabled={selectedCount === 0 || ordersLoading !== null}
                  className={`px-8 py-3 rounded-lg font-medium transition ${
                    selectedCount >= 2
                      ? "bg-amber-700 text-white hover:bg-amber-800"
                      : "bg-gray-300 text-gray-600 cursor-not-allowed"
                  }`}
                >
                  {selectedCount >= 2 
                    ? `Merge ${selectedCount} & Add (+Ksh 200 Tips)`
                    : "Select tables to merge"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Payments;