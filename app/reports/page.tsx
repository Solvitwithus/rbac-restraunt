"use client";

import React, { useEffect, useState } from "react";
import Menu from "../components/posmenu";
import { GetProcessedTransactions } from "../hooks/access";
import { Loader2, Receipt, Package, TrendingUp, Calendar } from "lucide-react";

interface Payment {
  name: string;
  TransAmount: string | number;
  Transtype: string;
}

interface Item {
  item_option: string;
  item_option_id: string;
  quantity: string;
  price: string;
  total: string | number;
}

interface Transaction {
  id: string;
  ptotal: string;
  pdate: string;
  order_no: string;
  invNo: string;
  customername: string;
  payments: string | null;
  pitems: string;
  uname: string;
}

interface ParsedTransaction extends Transaction {
  parsedPayments: Payment[];
  parsedItems: Item[];
}

type Tab = "transactions" | "itemized" | "summary";

export default function ReportsPage() {
  const [transactions, setTransactions] = useState<ParsedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("summary");

  // Date filters
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await GetProcessedTransactions({
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        });

        if (Array.isArray(data)) {
          const parsed = data.map((tx: Transaction) => ({
            ...tx,
            parsedPayments: tx.payments && tx.payments !== "null" ? JSON.parse(tx.payments) : [],
            parsedItems: JSON.parse(tx.pitems),
          }));
          setTransactions(parsed);
        } else {
          setTransactions([]);
        }
      } catch (err) {
        console.error("Failed to load transactions", err);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [startDate, endDate]);

  // Aggregated Summary
  const totalRevenue = transactions.reduce((sum, tx) => sum + parseFloat(tx.ptotal || "0"), 0);

  const totalCash = transactions.reduce((sum, tx) => {
    return (
      sum +
      tx.parsedPayments
        .filter((p: Payment) => p.Transtype === "CASH")
        .reduce((s, p) => s + parseFloat(p.TransAmount?.toString() || "0"), 0)
    );
  }, 0);

  const totalMpesa = totalRevenue - totalCash;

  const totalItemsSold = transactions.reduce(
    (sum, tx) => sum + tx.parsedItems.reduce((s, i) => s + parseFloat(i.quantity || "0"), 0),
    0
  );

  // Top Selling Items
  const itemSalesMap = new Map<string, { quantity: number; revenue: number }>();
  transactions.forEach((tx) => {
    tx.parsedItems.forEach((item: Item) => {
      const key = item.item_option;
      const current = itemSalesMap.get(key) || { quantity: 0, revenue: 0 };
      itemSalesMap.set(key, {
        quantity: current.quantity + parseFloat(item.quantity || "0"),
        revenue: current.revenue + parseFloat(item.total?.toString() || "0"),
      });
    });
  });

  const topItems = Array.from(itemSalesMap.entries())
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 8);

  const formatCurrency = (amount: number) =>
    `KES ${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString("en-KE", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const reportDateRange = startDate && endDate
    ? `${new Date(startDate).toLocaleDateString("en-KE")} - ${new Date(endDate).toLocaleDateString("en-KE")}`
    : startDate
    ? `From ${new Date(startDate).toLocaleDateString("en-KE")}`
    : endDate
    ? `Up to ${new Date(endDate).toLocaleDateString("en-KE")}`
    : "Today";

  return (
    <div className="min-h-screen bg-[#F7F5EE] flex flex-col">
      <Menu />

      <div className="flex-1 overflow-y-auto pb-2">
        <div className="pt-2 px-4 max-w-full mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-[#c9184a] mb-2">Sales Reports</h1>
            <p className="text-gray-600 flex items-center justify-center gap-2">
              <Calendar className="w-5 h-5" />
              {reportDateRange}
            </p>
          </div>

          {/* Date Filters */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter by Date Range</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#c9184a] focus:border-[#c9184a]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#c9184a] focus:border-[#c9184a]"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                  }}
                  className="w-full py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-8 overflow-x-auto pb-2">
            <div className="flex gap-6 border-b border-gray-300">
              {[
                { id: "summary", label: "Summary", icon: TrendingUp },
                { id: "transactions", label: "Transactions", icon: Receipt },
                { id: "itemized", label: "Itemized", icon: Package },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`flex items-center gap-2 pb-4 px-3 border-b-4 transition font-medium whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-[#c9184a] text-[#c9184a]"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-[#c9184a] mb-4" />
              <p className="text-gray-600">Loading transactions...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && transactions.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl shadow">
              <Receipt className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-xl text-gray-600">No transactions found for selected period</p>
            </div>
          )}

          {/* Content */}
          {!loading && transactions.length > 0 && (
            <>
              {/* Summary */}
              {activeTab === "summary" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                      <p className="text-gray-600 mb-2">Total Revenue</p>
                      <p className="text-3xl font-bold text-[#c9184a]">{formatCurrency(totalRevenue)}</p>
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                      <p className="text-gray-600 mb-2">Cash</p>
                      <p className="text-3xl font-bold text-green-600">{formatCurrency(totalCash)}</p>
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                      <p className="text-gray-600 mb-2">MPESA</p>
                      <p className="text-3xl font-bold text-blue-600">{formatCurrency(totalMpesa)}</p>
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                      <p className="text-gray-600 mb-2">Items Sold</p>
                      <p className="text-3xl font-bold text-purple-600">{totalItemsSold}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-[#c9184a] mb-6">Top Selling Items</h2>
                    <div className="space-y-4">
                      {topItems.map(([item, stats]) => (
                        <div key={item} className="flex justify-between items-center py-4 border-b">
                          <div>
                            <p className="font-semibold text-gray-800">{item}</p>
                            <p className="text-sm text-gray-500">{stats.quantity} units</p>
                          </div>
                          <p className="text-2xl font-bold text-[#c9184a]">{formatCurrency(stats.revenue)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Transactions & Itemized Tabs */}
              {(activeTab === "transactions" || activeTab === "itemized") && (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-[#c9184a]">
                      {activeTab === "transactions" ? `All Transactions (${transactions.length})` : "Itemized Sales Report"}
                    </h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          {activeTab === "transactions" && (
                            <>
                              <th className="px-6 py-4 text-left font-medium text-gray-700">Time</th>
                              <th className="px-6 py-4 text-left font-medium text-gray-700">Order #</th>
                              <th className="px-6 py-4 text-left font-medium text-gray-700">Invoice</th>
                              <th className="px-6 py-4 text-left font-medium text-gray-700">Items</th>
                              <th className="px-6 py-4 text-left font-medium text-gray-700">Payment</th>
                              <th className="px-6 py-4 text-right font-medium text-gray-700">Total</th>
                            </>
                          )}
                          {activeTab === "itemized" && (
                            <>
                              <th className="px-6 py-4 text-left font-medium text-gray-700">Item</th>
                              <th className="px-6 py-4 text-center font-medium text-gray-700">Qty</th>
                              <th className="px-6 py-4 text-center font-medium text-gray-700">Avg Price</th>
                              <th className="px-6 py-4 text-right font-medium text-gray-700">Revenue</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {activeTab === "transactions" &&
                          transactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-pink-50">
                              <td className="px-6 py-4">{formatDate(tx.pdate)}</td>
                              <td className="px-6 py-4 font-medium">{tx.order_no}</td>
                              <td className="px-6 py-4">{tx.invNo}</td>
                              <td className="px-6 py-4 max-w-xs truncate">
                                {tx.parsedItems.map((i: Item) => i.item_option).join(", ")}
                              </td>
                              <td className="px-6 py-4">
                                {tx.parsedPayments.length > 0
                                  ? tx.parsedPayments.map((p: Payment) => p.name || p.Transtype).join(" + ")
                                  : "CASH"}
                              </td>
                              <td className="px-6 py-4 text-right font-bold text-[#c9184a]">
                                {formatCurrency(parseFloat(tx.ptotal))}
                              </td>
                            </tr>
                          ))}

                        {activeTab === "itemized" &&
                          Array.from(itemSalesMap.entries())
                            .sort((a, b) => b[1].revenue - a[1].revenue)
                            .map(([itemName, stats]) => {
                              const avgPrice = stats.quantity > 0 ? stats.revenue / stats.quantity : 0;
                              return (
                                <tr key={itemName} className="hover:bg-pink-50">
                                  <td className="px-6 py-4 font-medium">{itemName}</td>
                                  <td className="px-6 py-4 text-center">{stats.quantity}</td>
                                  <td className="px-6 py-4 text-center">{formatCurrency(avgPrice)}</td>
                                  <td className="px-6 py-4 text-right font-bold text-[#c9184a]">
                                    {formatCurrency(stats.revenue)}
                                  </td>
                                </tr>
                              );
                            })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}