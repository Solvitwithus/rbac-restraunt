"use client";

import React, { useEffect, useState } from "react";
import { RestrauntTables } from "../hooks/access";


interface TableInfo {
  table_id: number;
  table_number: string;
  table_name: string;
  capacity: number;
  occupied_slots: number;
  available_slots: number;
  status: "available" | "partial" | "occupied";
}

export default function Tables() {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const tablesRes = await RestrauntTables();

        if (tablesRes.status === "SUCCESS") {
          setTables(tablesRes.tables || []);
        }
      } catch (err) {
        console.error("Error fetching tables:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-50 border-green-300 text-green-800 shadow-green-100";
      case "partial":
        return "bg-amber-50 border-amber-300 text-amber-800 shadow-amber-100";
      case "occupied":
        return "bg-red-50 border-red-300 text-red-800 shadow-red-100";
      default:
        return "bg-gray-50 border-gray-300 text-gray-800 shadow-gray-100";
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500";
      case "partial":
        return "bg-amber-500";
      case "occupied":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl font-medium text-gray-600 animate-pulse">
          Loading tables...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-3">
      <div className="max-w-[95%] mx-auto">
        <div className="text-center mb-3">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Restaurant Tables
          </h1>
          <p className="text-lg text-gray-600">
            {tables.length} table{tables.length !== 1 ? "s" : ""} available
          </p>
        </div>

        {tables.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-500">No tables found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {tables.map((table) => {
              const occupancyPercent =
                table.capacity > 0
                  ? table.occupied_slots / table.capacity * 100
                  : 0;

              return (
                <div
                  key={table.table_id}
                  className={`relative rounded-2xl border-2 p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl ${getStatusStyle(
                    table.status
                  )}`}
                >
                
                  <div
                    className={`absolute top-0 left-0 right-0 h-2 rounded-t-2xl ${getProgressColor(
                      table.status
                    )}`}
                  />

                  <div className="pt-4">
                    {/* Table Name & Number */}
                    <h3 className="text-lg text-center font-bold text-gray-900">
                      {table.table_name}
                    </h3>
                    <div className="border border-black/20"/>
                    <p className="text-sm text-gray-600 mt-1">
                      Table #{table.table_number}
                    </p>

                    {/* Stats Grid */}
                    <div className="mt-3 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">
                          Capacity
                        </span>
                        <span className="text-2xl font-bold text-gray-900">
                          {table.capacity}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">
                          Occupied
                        </span>
                        <span className="text-xl font-semibold text-red-700">
                          {table.occupied_slots}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">
                          Available
                        </span>
                        <span className="text-xl font-semibold text-green-700">
                          {table.available_slots}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-6">
                      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-700 ease-out ${getProgressColor(
                            table.status
                          )}`}
                          style={{ width: `${occupancyPercent}%` }}
                        />
                      </div>
                      <p className="text-right text-sm text-gray-600 mt-2">
                        {occupancyPercent}% occupied
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div className="mt-6 text-center">
                      <span
                        className={`inline-block px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wider ${getStatusStyle(
                          table.status
                        )} border`}
                      >
                        {table.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}