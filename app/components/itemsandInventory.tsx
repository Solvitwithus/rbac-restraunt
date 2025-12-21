"use client";


/**
 * =============================================================================
 * Item Inventory Overview (Stock List Page)
 * =============================================================================
 *
 * @file components/dasrestaurosch/ItemInventory.tsx (or similar)
 * @author John Kamiru Mwangi
 * @created 2025-12-03
 * @lastUpdated 2025-12-03
 *
 * @description
 *   Full-screen inventory/stock list view used in the POS module under
 *   "Stock List" navigation item. Displays every menu item available in the
 *   system with real-time search, sort, and manual refresh capabilities.
 *
 *   This component is primarily read-only and serves cashiers, managers,
 *   and kitchen staff who need quick reference to item names, prices,
 *   categories, units, and stock codes.
 *
 * @features
 *   • Live search by item description (case-insensitive)
 *   • Sort by name (alphabetical) or price (low → high)
 *   • Manual refresh button with loading skeletons
 *   • Responsive table layout (mobile → desktop)
 *   • Loading state with animated pulse placeholders
 *   • Empty state handling
 *   • Toast notifications on fetch errors
 *
 * @dataSource
 *   getMenu() → /app/hooks/access.ts
 *   Fetches the complete menu via tp=get_menu from the legacy backend.
 *
 * @keyHooks & Dependencies
 *   - React useState     → local UI state (search, sort, loading)
 *   - React useEffect    → initial data fetch on mount
 *   - React useMemo      → performant filtering + sorting
 *   - sonner toast       → user feedback
 *   - lucide-react icons → modern, lightweight UI icons
 *
 * @stylingNotes
 *   • Brand-consistent colors:
 *        – Primary accent:  #099c7f
 *        – Text / headings: #4B2E26
 *        – Backgrounds:     #F7F5EE / white
 *   • Hover states and subtle transitions for better UX
 *   • Mobile-first table with horizontal scroll on small screens
 *
 * @futureImprovements / TODOs
 *   • Add pagination or virtualized scrolling for 500+ items
 *   • Export to CSV / PDF button
 *   • Show item image thumbnails (when available)
 *   • Low-stock highlighting (if quantity field is added to backend)
 *   • Column visibility toggle
 *   • Click row → quick add to cart (for fast re-ordering)
 *   • Debounced search input
 *   • Cache menu with TanStack Query for offline resilience
 *
 * @notes
 *   - Prices are displayed in KSH (Kenyan Shillings)
 *   - This page is intentionally lightweight – no heavy dependencies
 *   - Menu data is shared with the POS cart search – keep MenuItemsTypes in sync
 *
 * =============================================================================
 */
import React, { useEffect, useState, useMemo } from "react";
import { MenuItemsTypes } from "./types";
import { toast } from "sonner";
import { getMenu } from "@/app/hooks/access";
import { RotateCcw, Search, ArrowUpDown } from "lucide-react";

function ItemInventory() {
  const [items, setItems] = useState<MenuItemsTypes[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("description");

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await getMenu();

      if (response.status === "SUCCESS" || response.status === 200) {
        setItems(response.menu_items || []);
      } else {
        toast.error("Failed to load menu");
      }
    } catch (e) {
      toast.error("Network error");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);


  const filteredItems = useMemo(() => {
    let data = [...items];

   
    if (search.trim() !== "") {
      data = data.filter((i) =>
        i.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    data.sort((a, b) => {
      if (sortBy === "price") return a.price - b.price;
      return a.description.localeCompare(b.description);
    });

    return data;
  }, [items, search, sortBy]);

  return (
    <div className="p-6">
     
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#4B2E26] tracking-wide">
          Inventory Overview
        </h2>

        <button
          onClick={fetchMenuItems}
          className="flex items-center gap-2 bg-[#099c7f] text-white px-4 py-2 rounded-lg shadow hover:bg-[#067a62] transition"
        >
          <RotateCcw size={18} />
          Refresh
        </button>
      </div>

     
      <div className="flex items-center gap-4 mb-5">
        {/* Search */}
        <div className="relative w-80">
          <Search className="absolute top-3 left-3 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search inventory..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm focus:border-[#099c7f] focus:ring-1 focus:ring-[#099c7f]"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 bg-white px-3 py-2 border rounded-lg shadow-sm">
          <ArrowUpDown size={16} className="text-gray-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent outline-none text-sm"
          >
            <option value="description">Sort by: Name</option>
            <option value="price">Sort by: Price</option>
          </select>
        </div>
      </div>

     
      <div className="border rounded-lg bg-white shadow p-4 overflow-hidden">
        {loading ? (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 h-32 rounded-lg animate-pulse"
              ></div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <p className="text-center text-gray-500 py-20">
            No inventory items found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-gray-600 text-sm">
                  <th className="py-3 px-2">Name</th>
                  <th className="py-3 px-2">Category</th>
                  <th className="py-3 px-2">Price</th>
                  <th className="py-3 px-2">Units</th>
                  <th className="py-3 px-2">Stock ID</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((val, idx) => (
                  <tr
                    key={idx}
                    className="border-b hover:bg-[#F7F5EE] transition"
                  >
                    <td className="py-2 px-2 font-medium text-[#4B2E26]">
                      {val.description}
                    </td>
                    <td className="py-2 px-2">{val.category_name}</td>
                    <td className="py-2 px-2 text-[#099c7f] font-semibold">
                      KSH {val.price}
                    </td>
                    <td className="py-2 px-2">{val.units}</td>
                    <td className="py-2 px-2">{val.stock_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ItemInventory;
