"use client";

import { GetAllActiveSessions, GetPerSessionOrders, UpdateItemstatus } from "@/app/hooks/access";
import React, { useEffect, useState, useCallback } from "react";
import { SessionType, OrderType } from "@/app/stores/useAuth";
import { toast } from "sonner";
import { TypingAnimation } from "@/components/ui/typing-animation";

export default function KitchenStatus() {
  const [sessions, setSessions] = useState<SessionType[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<SessionType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [sortBy, setSortBy] = useState<"asc" | "desc">("desc");

  // Orders (filtered to exclude Bar items)
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderType[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<"preparing" | "ready">("preparing");
  const [updating, setUpdating] = useState(false);

  // Fetch sessions
  useEffect(() => {
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

    fetchSessions();
    const interval = setInterval(fetchSessions, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Filter sessions (search, date, sort)
useEffect(() => {
  let filtered = [...sessions];

  // 🔴 EXCLUDE BAR SESSIONS
const excludedDepartments = ["bar", "winelounge"];

filtered = filtered.filter((s) => {
  if (!s.notes) return true; // Keep if no department
  const notes = s.notes.trim().toLowerCase();
  return !excludedDepartments.includes(notes);
});

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.table_name.toLowerCase().includes(term) ||
        s.table_number.toLowerCase().includes(term)
    );
  }

  if (startDate) {
    filtered = filtered.filter((s) => s.session_date >= startDate);
  }

  if (endDate) {
    filtered = filtered.filter((s) => s.session_date <= endDate);
  }

  filtered.sort((a, b) =>
    sortBy === "asc"
      ? a.session_date.localeCompare(b.session_date)
      : b.session_date.localeCompare(a.session_date)
  );

  setFilteredSessions(filtered);
}, [sessions, searchTerm, startDate, endDate, sortBy]);


  // Load and filter orders (exclude "Bar" notes)
  const handleSessionClick = useCallback(
    async (sessionId: string) => {
      if (selectedSessionId === sessionId) return;

      setSelectedSessionId(sessionId);
      setEditingOrderId(null);
      setLoadingOrders(true);
      setOrders([]);
      setFilteredOrders([]);

      try {
        const res = await GetPerSessionOrders({ session_id: sessionId });
        if (res?.status === "SUCCESS") {
          const allOrders = res.orders || [];
          setOrders(allOrders);

          // Filter out orders with notes === "Bar"
         const nonBarOrders = allOrders.filter((order) => {
  const notes = order.notes?.toLowerCase();
  return notes !== "bar" && notes !== "winelounge";
});
setFilteredOrders(nonBarOrders);
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

  // Auto-refresh orders
  useEffect(() => {
    if (!selectedSessionId) return;

    const refresh = async () => {
      try {
        const res = await GetPerSessionOrders({ session_id: selectedSessionId });
        if (res?.status === "SUCCESS") {
          const allOrders = res.orders || [];
          setOrders(allOrders);
         
          setFilteredOrders(
  allOrders.filter((o) => {
    const notes = o.notes?.toLowerCase();
    return notes !== "bar" && notes !== "winelounge";
  })
);
        }

        
      } catch {}
    };

    const id = setInterval(refresh, 30_000);
    return () => clearInterval(id);
  }, [selectedSessionId]);

  // Update status
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
        setOrders(prev =>
          prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        setFilteredOrders(prev =>
          prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        setEditingOrderId(null);
        setNewStatus("preparing");
      } else {
        toast.error("Update failed");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-4 mx-auto">
      {/* Left: Sessions - Fixed height with scroll */}
      <div className="w-full lg:w-1/2 min-h-[87vh] max-h-[87vh] flex flex-col">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Active Sessions</h2>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6 p-4 bg-white rounded-xl shadow">
          <input
            type="text"
            placeholder="Search table..."
            className="flex-1 min-w-[200px] px-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-4 py-2 border rounded-lg" />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-4 py-2 border rounded-lg" />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as "asc" | "desc")} className="px-4 py-2 border rounded-lg">
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>

        {/* Scrollable session list */}
        <div className="flex-1 overflow-y-auto pr-2">
          {filteredSessions.length === 0 ? (
            <p className="text-center text-gray-500 py-12">No active sessions</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredSessions.map((s) => (
                <div
                  key={s.session_id}
                  onClick={() => handleSessionClick(s.session_id)}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all hover:scale-105 shadow-md ${
                    selectedSessionId === s.session_id
                      ? "border-blue-500 bg-blue-50 shadow-xl"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  <h3 className="font-bold text-lg">{s.table_name} ({s.table_number})</h3>
                  <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">Guests: {s.guest_count}</p>
                  <p className="text-sm">
                    Status: <span className={s.status === "active" ? "text-green-600" : "text-orange-600"}>{s.status}</span>
                  </p>
                  </div>
                  <p className="text-sm">
                    Department: {s.notes}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">{new Date(s.start_time).toLocaleString()}</p>

                  <p className="text-xs text-right text-gray-500 mt-2">ID: {s.session_id}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Orders */}
      <div className="w-full lg:w-[45%] lg:sticky lg:top-4">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <TypingAnimation
            words={["Selected Order"]}
            className="text-[#c9184a] text-2xl font-semibold"
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
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl">
            <p className="text-lg text-gray-500">
              {selectedSessionId ? "No kitchen orders (Bar items excluded)" : "Select a session"}
            </p>
          </div>
        ) : (
          <div className="space-y-5 max-h-[80vh] overflow-y-auto pr-2">
            {filteredOrders.map((order) => (
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

                {editingOrderId === order.id && (
                  <div className="mt-6 pt-6 border-t flex flex-col sm:flex-row gap-4" onClick={(e) => e.stopPropagation()}>
                    {["served", "cancelled"].includes(order.status) ? (
                      <p className="text-red-600 font-semibold text-sm">
                        This order is <strong>{order.status}</strong> — no further updates allowed.
                      </p>
                    ) : (
                      <>
                        <select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value as "preparing" | "ready")}
                          className="px-5 py-3 border rounded-lg focus:ring-2 focus:ring-[#D4A373]"
                        >
                          <option value="preparing">Preparing</option>
                          <option value="ready">Ready</option>
                        </select>
                        <button
                          onClick={() => handleStatusChange(order.id)}
                          disabled={updating}
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