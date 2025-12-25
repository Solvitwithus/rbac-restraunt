"use client";

import { GetAllActiveSessions, GetPerSessionOrders, UpdateItemstatus } from "@/app/hooks/access";
import React, { useEffect, useState, useCallback } from "react";
import { SessionType, OrderType } from "@/app/stores/useAuth";
import { toast } from "sonner";
import { TypingAnimation } from "@/components/ui/typing-animation";

export default function MonitorOrders() {
  const [savedOrders, setSavedOrders] = useState<string[]>([]);
  const [sessions, setSessions] = useState<SessionType[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<SessionType[]>([]);
  const [manageMyOrders, setManageMyOrders] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [sortBy, setSortBy] = useState<"asc" | "desc">("desc");

  // Only show saved orders by default?
  const [onlyMyOrders, setOnlyMyOrders] = useState(true);

  // Orders
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<"cancelled" | "served">("served");
  const [updating, setUpdating] = useState(false);

  // Load saved orders from localStorage safely (client only)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem("myOrders");
    if (stored) {
      const orders = JSON.parse(stored) as string[];
      setSavedOrders(orders);
    }
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await GetAllActiveSessions();
      if (res?.status === "SUCCESS") {
        setSessions(res.sessions || []);
      }
    } catch (err) {
      toast.error("Failed to load sessions");
    }
  };

  // Fetch sessions on mount + every 60s
  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Filter sessions: My Orders vs All
  useEffect(() => {
    let filtered = [...sessions];

    if (onlyMyOrders && savedOrders.length > 0) {
      filtered = filtered.filter((s) => savedOrders.includes(s.session_id.toString()));
    }

    // Date filters
    if (startDate) filtered = filtered.filter((s) => s.session_date >= startDate);
    if (endDate) filtered = filtered.filter((s) => s.session_date <= endDate);

    // Sorting
    filtered.sort((a, b) =>
      sortBy === "asc"
        ? a.session_date.localeCompare(b.session_date)
        : b.session_date.localeCompare(a.session_date)
    );

    setFilteredSessions(filtered);
  }, [sessions, savedOrders, onlyMyOrders, startDate, endDate, sortBy]);

  const handleSessionClick = useCallback(
    async (sessionId: string) => {
      if (selectedSessionId === sessionId) return;

      setSelectedSessionId(sessionId);
      setEditingOrderId(null);
      setLoadingOrders(true);
      setOrders([]);

      try {
        const res = await GetPerSessionOrders({ session_id: sessionId });
        if (res?.status === "SUCCESS") {
          setOrders(res.orders || []);
        } else {
          toast.info("No orders yet");
        }
      } catch (err) {
        toast.error("Failed to load orders");
      } finally {
        setLoadingOrders(false);
      }
    },
    [selectedSessionId]
  );

  // Auto-refresh selected session orders
  useEffect(() => {
    if (!selectedSessionId) return;

    const refresh = async () => {
      try {
        const res = await GetPerSessionOrders({ session_id: selectedSessionId });
        if (res?.status === "SUCCESS") {
          setOrders(res.orders || []);
        }
      } catch {}
    };

    const id = setInterval(refresh, 30_000);
    return () => clearInterval(id);
  }, [selectedSessionId]);

  const handleStatusChange = async (orderId: string) => {
    if (!newStatus) return;

    setUpdating(true);
    try {
      const response = await UpdateItemstatus({
        status: newStatus,
        order_id: orderId,
      });

      if (response?.status === "SUCCESS") {
        toast.success("Status updated!");
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        setEditingOrderId(null);
        setNewStatus("served");
      } else {
        toast.error("Update failed");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setUpdating(false);
    }
  };

  const handleLocalSave = (order: string) => {
    if (!order.trim()) {
      toast.warning("Enter a valid session ID");
      return;
    }

    const existing = JSON.parse(localStorage.getItem("myOrders") || "[]") as string[];
    if (existing.includes(order.trim())) {
      toast.info("Already saved");
      return;
    }

    const updated = [...existing, order.trim()];
    localStorage.setItem("myOrders", JSON.stringify(updated));
    setSavedOrders(updated);
    setOrderNumber("");
    toast.success("Saved to My Orders");
  };

  const clearOrders = () => {
    localStorage.removeItem("myOrders");
    setSavedOrders([]);
    toast.success("Cleared all saved orders");
  };

  const loadOrders = () => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("myOrders");
    const orders = stored ? JSON.parse(stored) : [];
    setSavedOrders(orders);
  };

  useEffect(() => {
    if (manageMyOrders) loadOrders();
  }, [manageMyOrders]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-4 mx-auto">
      {/* Left: Sessions */}
      <div className="w-full lg:w-1/2">
        <div className="flex justify-between items-center">
          <h2 className="hidden lg:block text-2xl font-bold text-gray-800">Active Sessions</h2>

          <div className="flex gap-3 mb-1">
            <button
              onClick={() => setOnlyMyOrders(!onlyMyOrders)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                onlyMyOrders && savedOrders.length > 0
                  ? "bg-[#c9184a] text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {onlyMyOrders && savedOrders.length > 0
                ? `My Orders Only (${savedOrders.length})`
                : "Showing All Sessions"}
            </button>

            <button
              onClick={() => setManageMyOrders(true)}
              className="px-5 py-2.5 rounded-xl bg-gray-900 text-white font-semibold shadow-md hover:bg-gray-800 transition"
            >
              Manage My Orders
            </button>
          </div>
        </div>

        {/* Manage My Orders Modal */}
        {manageMyOrders && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={() => setManageMyOrders(false)}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
            <div
              className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b pb-3 mb-2">
                <h2 className=" sm:text-[0.6rem] lg:text-xl font-bold">Manage My Orders</h2>
                <button
                  onClick={() => setManageMyOrders(false)}
                  className="text-2xl hover:bg-gray-100 rounded-lg w-10 h-10"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col md:flex-row gap-3 mb-2">
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="Enter Session ID"
                  className="flex-1 p-3 border rounded-lg"
                />
                <button
                  onClick={() => handleLocalSave(orderNumber)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  Save
                </button>
                <button
                  onClick={clearOrders}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Clear All
                </button>
              </div>

              <div className="max-h-[50vh] overflow-y-auto space-y-2">
                {savedOrders.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No saved orders</p>
                ) : (
                  savedOrders.map((order, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-gray-100 rounded-lg flex justify-between items-center"
                    >
                      <span className="font-medium">{order}</span>
                      <button
                        onClick={() => {
                          const filtered = savedOrders.filter((_, i) => i !== idx);
                          localStorage.setItem("myOrders", JSON.stringify(filtered));
                          setSavedOrders(filtered);
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Date & Sort Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-4 p-2 bg-white rounded-xl shadow">
          <label className="hidden lg:block text-black/50">Start Date</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="sm:px-1 lg:px-4 py-2 border rounded-lg" />
          <label className="hidden lg:block text-black/50">End Date</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="sm:px-1 lg:px-4 py-2 border rounded-lg" />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as "asc" | "desc")} className="hidden lg:block px-4 py-2 border rounded-lg">
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>

        {/* Session Cards */}
        {filteredSessions.length === 0 ? (
          <p className="text-center text-gray-500 py-12">
            {onlyMyOrders && savedOrders.length > 0
              ? "No matching saved sessions found"
              : "No active sessions"}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3  gap-2 max-h-[85%] overflow-y-auto py-3">
            {filteredSessions.map((s) => (
              <div
                key={s.session_id}
                onClick={() => handleSessionClick(s.session_id)}
                className={`relative p-2 rounded-xl border-2 w-[94%] mb-3 cursor-pointer transition-all hover:scale-105 shadow-md ${
                  selectedSessionId === s.session_id
                    ? "border-blue-500 bg-blue-50 shadow-xl"
                    : "border-gray-300 bg-white"
                }`}
              >
                {/* My Order Badge */}
                {savedOrders.includes(s.session_id.toString()) && (
                  <div className="absolute -top-3 -right-3 bg-[#c9184a] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    MY ORDER
                  </div>
                )}
<div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">{s.table_name} ({s.table_number})</h3>
                <p className="text-sm text-gray-600">Guests: {s.guest_count}</p>
                </div>
                <p className="text-sm">
                  Fowarded to: <span className={s.status === "active" ? "text-green-600" : "text-orange-600"}>{s.notes}</span>
                </p>
                <p className="text-xs text-gray-500 mt-2">{new Date(s.start_time).toLocaleString()}</p>
                <p className="text-xs text-right text-gray-500 mt-2">ID: {s.session_id}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: Orders Panel */}
      <div className="w-full lg:w-[45%] lg:sticky lg:top-4">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
       
            <TypingAnimation
        words={["Selected Order"]}
        className="text-green-800 text-2xl z-10 font-semibold"
        blinkCursor
        startOnView={false}
      />
          {selectedSessionId && (
            <span className="text-lg text-gray-600">
              (Table {filteredSessions.find((s) => s.session_id === selectedSessionId)?.table_number})
            </span>
          )}
        </h2>

        {loadingOrders ? (
          <p className="text-center py-20 text-gray-500">Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl">
            <p className="text-lg text-gray-500">
              {selectedSessionId ? "No orders yet" : "Select a session to view orders"}
            </p>
          </div>
        ) : (
          <div className="space-y-5 max-h-[63%] overflow-y-auto pr-2">
            {orders.map((order) => (
              <div
                key={order.id}
                className={`p-6 rounded-xl border-l-8 shadow-lg transition-all cursor-pointer hover:shadow-xl ${
                  order.status === "pending" ? "bg-yellow-50 border-yellow-400" :
                  order.status === "preparing" ? "bg-blue-50 border-blue-400" :
                  order.status === "ready" ? "bg-green-50 border-green-500" :
                  order.status === "served" ? "bg-purple-50 border-purple-400" :
                  order.status === "cancelled" ? "bg-red-50 border-red-400" :
                  "bg-gray-50 border-gray-300"
                }`}
                onClick={() => setEditingOrderId(editingOrderId === order.id ? null : order.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-bold text-xl">{order.item_description}</h4>
                    <p className="text-gray-600 mt-1">
                      Qty: <strong>{order.quantity}</strong> × KES {order.unit_price.toLocaleString()}
                    </p>
                    <div className="mt-3">
                      <span className="text-sm font-medium uppercase text-gray-700">Status:</span>{" "}
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        order.status === "pending" ? "bg-yellow-200 text-yellow-900" :
                        order.status === "preparing" ? "bg-blue-200 text-blue-900" :
                        order.status === "ready" ? "bg-green-200 text-green-900" :
                        order.status === "served" ? "bg-purple-200 text-purple-900" :
                        order.status === "cancelled" ? "bg-red-200 text-red-900" :
                        "bg-gray-200 text-gray-700"
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-700">
                      KES {order.line_total.toLocaleString()}
                    </p>
                  </div>
                </div>

                {order.notes && (
                  <p className="mt-4 text-sm italic text-gray-600">Note: {order.notes}</p>
                )}

                { editingOrderId === order.id && (
                  <div className="mt-6 pt-6 border-t flex flex-col sm:flex-row gap-4" onClick={(e) => e.stopPropagation()}>
                    {["served", "cancelled","ordered","preparing"].includes(order.status) ? (
                      <p className="text-red-600 font-semibold text-sm">
                        This order is <strong>{order.status}</strong> — no further updates allowed.
                      </p>
                    ) : (
                      <>
                        <select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value as "cancelled" | "served")}
                          className="px-5 py-3 border rounded-lg focus:ring-2 focus:ring-[#D4A373]"
                        >
                          <option value="served">Served</option>
                          <option value="cancelled">Cancel</option>
                        </select>
                        <button
                          onClick={() => handleStatusChange(order.id)}
                          disabled={updating }
                          className="px-8 py-3 bg-[#D4A373] text-black/80 font-semibold rounded-lg hover:bg-[#c4955f] disabled:opacity-60"
                        >
                          {updating ? "Updating..." : "Update Status"}
                        </button>
                        <button
                          onClick={() => setEditingOrderId(null)}
                          className="px-6 py-3 border rounded-lg hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}