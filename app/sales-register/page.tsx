"use client";

import React from "react";
import Menu from "../components/posmenu";
import Posdisplaypanem from "../components/pos-display-panel";
import Posregisteritemsection from "../components/pos-registration-item-section";
import { AutoLogout } from "../components/autoLogout";
import { usePermissions } from "../stores/useAuth";

function Page() {
  const { permissions, hydrated } = usePermissions();

  // 1️⃣ Still loading from localStorage
  if (!hydrated) {
    return (
     <div className="min-h-screen bg-[#F7F5EE] p-4 animate-pulse">
  {/* Top Nav Skeleton */}
  <div className="h-14 bg-white rounded-xl shadow mb-4"></div>

  {/* Main Content */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    
    {/* Left Panel */}
    <div className="bg-white rounded-xl shadow p-4 space-y-3">
      <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
    </div>

    {/* Center Display */}
    <div className="md:col-span-2 bg-white rounded-xl shadow p-4">
      <div className="h-5 w-1/3 bg-gray-200 rounded mb-4"></div>

      {/* Fake table rows */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex justify-between">
            <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
            <div className="h-4 w-1/6 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
</div>

    );
  }

  // 2️⃣ Hydrated but NO permissions
  if (!permissions || Object.keys(permissions).length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        You don’t have any permissions
      </div>
    );
  }

  // 3️⃣ All good
  return (
    <div className="min-h-screen h-fit sm:h-auto overflow-y-auto min-w-min bg-[#F7F5EE]">
      <Menu />

      <div className="flex my-4 gap-1 mx-2">
        <AutoLogout />
        <Posdisplaypanem />
        <Posregisteritemsection />
      </div>
    </div>
  );
}

export default Page;
