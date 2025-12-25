"use client";



/**
 * =============================================================================
 * POS Display Panel (Right-hand Cart / Order Summary)
 * =============================================================================
 *
 * @author John Kamiru Mwangi
 * @description
 *   Main right-side panel of the Point-of-Sale interface. Handles:
 *     • Quick item search & addition (by name or stock code)
 *     • Cart management (add, remove, quantity aggregation)
 *     • Order total calculation
 *     • "Place Order" – creates a restaurant session + sends items to backend
 *     • "Hold Order" – persists current cart locally (via /api/orders) for later recall
 *     • "Held Orders" – view, restore, or permanently delete saved carts
 *
 * @features
 *   - Real-time search with debounced dropdown (max 8 results)
 *   - Automatic quantity grouping in cart view
 *   - Session creation flow (table selection, guest count, session type, remarks, priority, server)
 *   - Hold-order naming & persistence (POST /api/orders)
 *   - Held-order listing with restore (PATCH /api/orders) and delete (DELETE /api/orders)
 *   - Responsive modals with backdrop blur & animations
 *   - Toast notifications via Sonner
 *
 * @keyHooks
 *   - useSelectedData()       → global cart store (selectedItems, setSelectedItems, clearSelectedItems)
 *   - useLoginSession()       → provides list of available servers/users
 *   - Custom hooks:
 *        • RestrauntTables()   → fetches available tables
 *        • getMenu()           → fetches full menu for search
 *        • SessionCreation()   → creates a new dining session
 *        • CreateOrderItem()   → adds individual items to a session
 *
 * @apiEndpointsUsed
 *   POST   /api/orders                → Hold current cart
 *   GET    /api/orders                → Retrieve all held orders
 *   PATCH  /api/orders?orderName=…    → Mark held order as "restored" (optional cleanup)
 *   DELETE /api/orders?orderName=…    → Permanently delete a held order
 *
 * @importantState
 *   - selectedItems        → current cart (array of MenuItemsTypes, duplicates allowed)
 *   - itemCounts           → memoized object {stock_id: {item, count}}
 *   - searchResults        → memoized filtered menu items for dropdown
 *   - heldOrders           → array of saved carts fetched from backend
 *
 * @futureImprovements / TODOs
 *   • Add quantity +/- buttons directly in cart rows
 *   • Implement discount / tax calculation section
 *   • Support item notes / modifiers per line item
 *   • Keyboard shortcuts (e.g., F2 → focus search, F8 → place order)
 *   • Drag-and-drop reordering of items
 *   • Print kitchen docket automatically after placing order
 *   • Offline-first queue for unreliable networks
 *   • Accessibility (ARIA labels, keyboard navigation)
 *
 * @notes
 *   - All monetary values are displayed in KSH (Kenyan Shillings)
 *   - Image placeholder currently uses a generic food.jpeg – replace with actual item images when available
 *   - Loading states are managed per-action to prevent double submission
 *
 * @date Dec3 2025
 * =============================================================================
 */
import React, { useEffect, useState, useMemo } from 'react';
import { Pause, PlayIcon, Search, SidebarCloseIcon, X,LockIcon ,Trash2} from 'lucide-react';
import { CreateOrderItem, SessionCreation, RestrauntTables, StaffMembers,GetDepartments } from '@/app/hooks/access';
import { useSelectedData } from '../stores/useAuth';
import { getMenu } from '@/app/hooks/access';
import { toast } from 'sonner';
import Image from 'next/image';
import Globe from '@/public/food.jpeg';
import axios from 'axios';
import Link from 'next/link';
import { Department, DepartmentsResponse, Staff } from './types';

import { usePermissions } from '../stores/useAuth';

export interface TableInfo {
  table_id: string;
  table_number: string;
  table_name: string;
  capacity: string;
  occupied_slots: string;
  available_slots: string;
  status: string;
}

export interface MenuItemsTypes {
  stock_id: string;
  name: string;
  description: string;
  price: number;
  units: string;
  category_id: string;
  category_name: string;
}

export interface RestureItemsTypes {
  id?: string;
  orderName: string;
  createdAt: string;
  items: {
    stock_id: string;
    name: string;
    description: string;
    price: number;
    units: string;
    category_id: string;
    category_name: string;
  }[];
}


export interface ServerInfo {
  status: string;  
  id: string;
  token: string;  
   name: string;
  user: {
    id: string;
    username: string;
    name: string;
    role: string;
    store: string;
  };
  timestamp: string;
}


function Posdisplaypanem() {
  const { clearSelectedItems, selectedItems, setSelectedItems } = useSelectedData();
 
const {permissions}= usePermissions()
  const [processOrderModalOpen, setProcessOrderModalOpen] = useState(false);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemsTypes[]>([]);
  const [staffMembers, setstaffMembers] = useState<Staff[]>([])
  const [selectedServer, setSelectedServer] = useState('');
const [priority, setPriority] = useState('');
  const [selectedTable, setSelectedTable] = useState('');
  const [numGuests, setNumGuests] = useState(0);
  const [remarks, setRemarks] = useState('');
  const [sessionType, setSessionType] = useState('');
  const [loading, setLoading] = useState(false);
const [holdOrderSnip, setholdOrderSnip] = useState(false)
const [orderName, setorderName] = useState<string>("")
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
const [departments, setdepartments] = useState<DepartmentsResponse | null>(null)
  const [heldOrdersOpen, setHeldOrdersOpen] = useState(false);
const [heldOrders, setHeldOrders] = useState<Department[]>([]);
    const fetchTables = async () => {
      try {
        
        const res = await RestrauntTables();
        if (res.status === "SUCCESS") {
          
          setTables(res.tables || []);
          console.log("my",res);
          
          
        }
      } catch (e) {
        console.error("Failed to fetch tables", e);
      }
    };
  // Fetch tables
  useEffect(() => {

    const fetchDepartments =async()=>{
      const resp = await GetDepartments()
      setdepartments(resp.departments)
      console.log("dep",resp.departments);
      
    }
    fetchTables();
fetchDepartments()

    const fetchStaff = async()=>{
         try {
        
        const res = await StaffMembers();
        if (res?.status === "SUCCESS") {
          setstaffMembers(res?.staff || []);
        }
      } catch (e) {
        console.error("Failed to fetch tables", e);
      }

    }
    fetchStaff()
  }, []);

  // Fetch menu items for search
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await getMenu();
        if (res.status === "SUCCESS" || res.status === 200) {
          setMenuItems(res.menu_items || []);
        }
      } catch (e) {
        console.error("Failed to load menu", e);
      }
    };
    fetchMenu();
  }, []);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return menuItems
      .filter(
        (item) =>
          item.description.toLowerCase().includes(q) ||
          item.stock_id.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [searchQuery, menuItems]);

  const addItem = (item: MenuItemsTypes) => {
    setSelectedItems([...selectedItems, item]);
    toast.success(`${item.description} added`);
    setSearchQuery('');
    setShowResults(false);
  };

  // Item counts
  const itemCounts = useMemo(() => {
    const counts: Record<string, { item: MenuItemsTypes; count: number }> = {};
    selectedItems.forEach((it) => {
      if (counts[it.stock_id]) {
        counts[it.stock_id].count += 1;
      } else {
        counts[it.stock_id] = { item: it, count: 1 };
      }
    });
    return counts;
  }, [selectedItems]);
console.log("drive",{selectedTable,tables});

  const total = selectedItems.reduce((sum, i) => sum + i.price, 0).toFixed(2);
const selectedTableInfo = useMemo(() => {
  return tables.find(table => table.table_id === Number(selectedTable)  ) || null;
}, [tables, selectedTable]);

const availableSlots = selectedTableInfo 
  ? Number(selectedTableInfo.available_slots?.toString().trim()) || 0 
  : 0;

const hasEnoughSlots = numGuests > 0 && numGuests <= availableSlots;
console.log("slots",hasEnoughSlots);

 const handleProcessOrder = async () => {
  setLoading(true)
 

  try {
 if (selectedItems.length === 0) {
  toast.warning("Please add items to the order");
  return;
}

if (!selectedTable) {
  toast.warning("Please select a table");
  return;
}
if(!selectedServer){
   toast.warning("Please select a Server");
  return;
}
if(!priority){
    toast.warning("Please select a Priority");
  return;
}

if (numGuests <= 0) {
  toast.warning("Please enter number of guests");
  return;
}

if (!hasEnoughSlots) {
  toast.warning(
    `Only ${availableSlots} seat${availableSlots === 1 ? '' : 's'} available. You've Exceeded Limit!`
  );
  setNumGuests(availableSlots)
  return;
}
if(remarks===""){
   toast.warning("Please select a department to direct the order to");
  return;
}
 console.log("see",{selectedTable,
      numGuests,
      sessionType,
      remarks} );
 

    // 1️⃣ Create session
    const data = await SessionCreation(
      selectedTable,
      numGuests,
      sessionType || undefined,
      remarks || undefined
    );

    if (!(data.status === "SUCCESS" || data.status_code === 200)) {
      toast.error("Failed to process order");
      return;
    }

    const sessionID = data.session_id;
 
    toast.success(`Session with id: ${sessionID} created`);
setSelectedTable('');
setNumGuests(0);
setRemarks('');
setSessionType('');
    setProcessOrderModalOpen(false);

    clearSelectedItems()
    const groupedItems = selectedItems.reduce((acc: any, item) => {
      if (!acc[item.stock_id]) {
        acc[item.stock_id] = { ...item, quantity: 1 };
      } else {
        acc[item.stock_id].quantity += 1;
      }
      return acc;
    }, {});

    const finalItems = Object.values(groupedItems);


    console.log("huy",finalItems);
    
    // 3️⃣ Send each item to the "create order" endpoint
    await Promise.all(
      finalItems.map((item: any) =>
        CreateOrderItem({
          session_id: sessionID,
          item_code: item?.stock_id,
          quantity: item?.quantity,
          client_name: "clientName",
          notes: item.notes || undefined,
         
        })
      )
    );

    toast.success("Items added successfully");


    
  } catch (error) {
    toast.error("Error processing order");
    console.error(error);
  } finally {
    setLoading(false);
    
  }
};


const handleHold = async () => {
  if (!orderName.trim()) {
    toast.error("Please provide an order name");
    return;
  }

  if (selectedItems.length === 0) {
    toast.error("No items to hold");
    return;
  }

  try {
    setLoading(true);
    const payload = { orderName, selectedItems };
    console.log("payload:", payload);

    const response = await axios.post("/api/orders", payload);
    if (response.data.status === "SUCCESS") {
    toast.success("Order held successfully");
    setholdOrderSnip(false);

    clearSelectedItems();
    setorderName("");
    }
} catch (error: unknown) {
  console.error(error);

  if (axios.isAxiosError(error)) {
    // Axios-specific error handling
    if (error.response?.status === 409) {
      toast.error("Order name already exists");
    } else {
      toast.error("Failed to hold order");
    }
  } else {
    // Non-Axios error (unexpected)
    toast.error("Unexpected error occurred");
  }

} finally {
  setLoading(false);
}

};







  return (
     <div
  className={`flex flex-col min-h-screen max-h-screen lg:min-h-0 lg:max-h-none gap-3 items-end w-full ${
    permissions.viewMenu ? "md:w-1/2 " : ""
  }`}
>


      {/* Main Cart Panel */}

      {permissions.takeOrder && (
      <div className="border w-full p-1 h-163 rounded-md  border-black">

        {/* Header + Search */}
        <div className="sticky top-0 bg-white rounded-lg border-b border-gray-300 p-4 z-10">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={clearSelectedItems}
              className="text-sm cursor-pointer font-bold text-green-600 hover:underline"
            >
              Take New Order
            </button>
<div className='flex gap-2 items-center'>
            <span className="text-sm font-bold text-red-600/80">Input code</span>
            {permissions.trackOrder && (
 <Link href="/track-orders" className="text-[#c9184a] font-medium">
          Track Orders
        </Link>
            )}
           
        </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              placeholder="Search by name or code..."
              className="w-full pl-10 pr-10 py-2.5 bg-gray-100 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {searchQuery && (
              <X
                className="absolute right-3 top-3 h-4 w-4 cursor-pointer text-gray-500 hover:text-black"
                onClick={() => {
                  setSearchQuery('');
                  setShowResults(false);
                }}
              />
            )}

            {/* Dropdown Results */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-2xl z-50 max-h-64 overflow-y-auto">
                {searchResults.map((item) => (
                  <div
                    key={item.stock_id}
                    onClick={() => addItem(item)}
                    className="flex items-center gap-3 p-3 hover:bg-green-50 cursor-pointer border-b last:border-0"
                  >
                    <Image src={Globe} width={40} height={40} alt="" className="rounded" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.description}</p>
                      <p className="text-xs text-gray-500">
                        {item.stock_id} • {item.units}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-green-600">Add</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Selected Items List */}
        <div className="p-4 max-h-128 overflow-y-auto">
          <h3 className="font-bold text-lg mb-3">Selected Items ({selectedItems.length})</h3>
          {selectedItems.length === 0 ? (
            <p className="text-center text-gray-500 py-10">No items added yet</p>
          ) : (
            <div className="space-y-3">
              {Object.values(itemCounts).map(({ item, count }) => (
                <div key={item.stock_id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <Image src={Globe} width={48} height={48} alt="" className="rounded" />
                    <div>
                      <p className="font-medium">{item.description}</p>
                      <p className="text-sm text-gray-600">
                        {count} × KSHs: {item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const idx = selectedItems.findIndex(i => i.stock_id === item.stock_id);
                      if (idx > -1) {
                        setSelectedItems(selectedItems.filter((_, i) => i !== idx));
                      }
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>)}

      {/* Totals & Action Buttons */}
      {
        permissions.totalPlusActionButtons && (
<div className="w-full lg:w-[85%] bg-[#F6EFE7] border border-red-600/30 rounded-xl p-5 shadow">
        <div className="space-y-3 mb-5">
          <div className="flex justify-between text-lg">
            <span className="font-bold">Total:</span>
            <span className="font-bold text-green-600">KSHs: {total}</span>
          </div>
          <div className="hidden md:flex justify-between text-lg">
  <span className="font-bold">Discount:</span>
  <span className="font-bold text-green-600">KSHs: 0.00</span>
</div>

         
        </div>

        <div className="flex gap-5 justify-between mt-4">
    
{
    permissions.placeOrder && (
            <button

           
      type="button"
 onClick={() => {
    if (selectedItems.length <=0) {
      toast.error("Cannot place empty order");
      return;
    }
    setProcessOrderModalOpen(true);
  }}
      className="flex-1 p-1 bg-[#c9184a] py-2 font-semibold text-white rounded-md 
                 shadow-sm cursor-pointer hover:bg-[#a3153e] active:scale-95 transition-all"
    >
      Place Order
    </button>
    )
}


{
    permissions.holdOrder && (
 <button
  type="button"
  className="flex-1 p-1 flex items-center justify-center gap-2 bg-[#099c7f] py-2 
             font-semibold cursor-pointer text-white rounded-md shadow-sm
             hover:bg-[#077d66] active:scale-95 transition-all"
             onClick={()=>{setholdOrderSnip(true)}}
>
  <Pause height={18} width={18} className="text-white" />
  Hold Order
</button>
    )
}

{
    permissions.LoadHeldOrders && (
        <button
  type="button"
  className={`flex-1 p-1 cursor-pointer
    ${loading ? "bg-[#086d59]/60 pointer-events-none" : "bg-[#086d59]"}
    flex items-center justify-center gap-2 py-2 
    font-semibold text-white rounded-md shadow-sm
    hover:bg-[#077d66] active:scale-95 transition-all`}
  onClick={async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/orders");
      if (res.data.status === "SUCCESS") {
        setHeldOrders(res.data.orders);
        setHeldOrdersOpen(true);
      }
    } catch (err: unknown) {
      console.error(err);
      toast.error("Failed to load held orders");
    } finally {
      setLoading(false);
    }
  }}
  disabled={loading} // disables native button click
>
  <PlayIcon height={18} width={18} className="text-white" />
  {loading ? "Fetching Orders" : "Held Orders"}
</button>
    )
}

{
    permissions.payments && (
           <Link
      
     href={"/payments"}
      className="flex-1 p-1 bg-[#4B2E26] text-center py-2 font-semibold text-white rounded-md 
                 shadow-sm cursor-pointer hover:bg-[#3a221d] active:scale-95 transition-all"
    >
      
      Payments
    </Link>
    )
}








 
     
        </div>
      </div>
        )
      }
      

           {/* Modal */}
{processOrderModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    {/* Background Blur */}
    <div
      className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      onClick={() => setProcessOrderModalOpen(false)}
    />

    {/* Modal Box */}
    <div className="relative z-50 bg-[#F7F5EE] rounded-2xl shadow-2xl p-6 w-[400px] flex flex-col gap-4 animate-fadeIn">
      <h2 className="text-xl font-bold text-[#1E3932] text-center">Process Order</h2>

      <div className="flex flex-col gap-3 w-full">
        {/* Table Select */}
        <label className="text-[#4B2E26] font-semibold">Select Table</label>
        <select
          className="w-full border border-[#1E3932]/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#099c7f]"
          value={selectedTable}
          onChange={(e) => setSelectedTable(e.target.value)}
        >
          <option value="">Select Table to Serve</option>
          {tables?.map((val) => (
            <option key={val.table_id} value={val.table_id}>
              {val.table_name} - {val.available_slots} of {val.capacity} Available
            </option>
          ))}
        </select>

        {/* Server Select */}
        <label className="text-[#4B2E26] font-semibold">Select Server</label>
    <select
  className="w-full border border-[#1E3932]/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#099c7f]"
  value={selectedServer}
  onChange={(e) => setSelectedServer(e.target.value)}
>
  <option value="" disabled>-- Select User --</option>

  {staffMembers.length > 0 ? (
    staffMembers.map((val, index) => (
      <option 
        key={val.id ?? index}
        value={val.id}
      >
        {val.real_name}
      </option>
    ))
  ) : (
    <option value="">No user currently</option>
  )}





        </select>

        {/* Priority */}
        <label className="text-[#4B2E26] font-semibold">Select Priority</label>
        <select
          className="w-full border border-[#1E3932]/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#099c7f]"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="">Select Priority</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
          <option value="vip">VIP / Special</option>
          <option value="takeaway">Takeaway</option>
          <option value="dine-in">Dine-in</option>
          <option value="delivery">Delivery</option>
          <option value="pre-order">Pre-Order</option>
        </select>

        {/* Number of Guests */}
        <label className="text-[#4B2E26] font-semibold">Number of Guests</label>
        <input
          type="number"
          min={0}
          placeholder="Number of guests"
          className="w-full border border-[#1E3932]/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#099c7f]"
          value={numGuests}
          onChange={(e) => setNumGuests(Number(e.target.value))}
        />

        {/* Remarks */}
        <label className="text-[#4B2E26] font-semibold">Department</label>
        
 <select
  value={remarks}
  onChange={(e) => setRemarks(e.target.value)}
  required // Native HTML validation
  className="w-full appearance-none bg-white border border-[#1E3932]/30 rounded-md px-4 py-3 pr-10 text-gray-700 
             focus:outline-none focus:ring-2 focus:ring-[#099c7f] focus:border-transparent 
             hover:border-[#1E3932]/50 transition-all duration-200 cursor-pointer"
>
  {/* This option is disabled + hidden from selection */}
  <option value="" disabled >
    Select a department
  </option>
  {departments.length > 0 ? (
    departments.map((dept) => (
      <option key={dept.dept_id} value={dept.dept_name}>
        {dept.dept_name}
      </option>
    ))
  ) : (
    <option value="" disabled>
      No departments available
    </option>
  )}
</select>

        {/* Session Type */}
        <label className="text-[#4B2E26] font-semibold">Select Session Type</label>
        <select
          className="w-full border border-[#1E3932]/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#099c7f]"
          value={sessionType}
          onChange={(e) => setSessionType(e.target.value)}
        >
          <option value="">Select Session</option>
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="happy_hour">Happy Hour</option>
          <option value="late_night">Late Night</option>
          <option value="special_event">Special Event</option>
          <option value="pre_order">Pre-Order</option>
        </select>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-2 w-full mt-3">
        {/* Process Order */}
     <button
  type="button"
  disabled={loading}
  onClick={handleProcessOrder}
  className={`w-full flex items-center justify-center gap-2 py-2 font-semibold text-[#1E3932] rounded-md shadow-md transition-all active:scale-95 ${
    loading
      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
      : "bg-[#D4AF37] hover:bg-[#c9a034]"
  }`}
>
  {loading ? "Processing Order..." : "Process Order"}
</button>

        {/* Cancel Button */}
        <button
          type="button"
          onClick={() => setProcessOrderModalOpen(false)}
          className="w-full flex items-center justify-center gap-2 bg-[#099c7f] py-2 font-semibold text-white rounded-md shadow-md hover:bg-[#077d66] active:scale-95 transition-all"
        >
          <SidebarCloseIcon height={18} width={18} className="text-white" />
          Cancel
        </button>
      </div>
    </div>
  </div>
)}


{holdOrderSnip && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
    <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6 relative animate-in fade-in zoom-in duration-200">

      {/* Close Button */}
      <button
        onClick={() => setholdOrderSnip(false)}
        className="absolute right-4 top-4 text-gray-600 hover:text-black transition"
      >
        <X size={20} />
      </button>

      <h2 className="text-xl font-semibold text-[#1E3932] mb-4">Hold Order</h2>

      {/* Input */}
      <input
        type="text"
        placeholder="Order name"
        value={orderName}
        onChange={(e) => setorderName(e.target.value)}
        className="border w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#099c7f] mb-4"
      />

      {/* Button */}
      <button
        type="button"
        disabled={loading}
        onClick={handleHold}
        className={`w-full flex items-center justify-center gap-2 py-2 font-semibold rounded-md shadow-md active:scale-95 transition-all
          ${
            loading
              ? "bg-gray-400 text-gray-700 cursor-not-allowed"
              : "bg-[#D4AF37] text-[#1E3932] hover:bg-[#c9a034]"
          }
        `}
      >
        {loading ? "Please wait..." : "Hold order"}
      </button>

    </div>
  </div>
)}


{heldOrdersOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    {/* Backdrop */}
    <div
      className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      onClick={() => setHeldOrdersOpen(false)}
    />

    {/* Modal */}
    <div className="relative z-50 bg-white rounded-xl shadow-2xl p-5 w-[90%] max-w-[1200px] max-h-[80vh] overflow-y-auto">
      <h2 className="font-bold text-xl mb-4 text-center text-[#1E3932]">
        Held Orders
      </h2>

      {heldOrders.length === 0 ? (
        <p className="text-center text-gray-500">No held orders found</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 border-t border-black/30 pt-3">
          {heldOrders.map((order) => (
            <div
              key={order.id}
              className="relative p-4 border rounded-lg shadow-sm bg-gray-50 hover:bg-green-50 transition"
            >
              {/* Delete icon */}
            <button
  className="absolute top-2 right-2 z-10 text-red-500 hover:scale-125 hover:text-green-900"
  onClick={async (e) => {
    e.stopPropagation(); // Prevent restore

    if (!confirm(`Are you sure you want to delete order "${order.orderName}"?`)) return;

 try {
   const response = await axios.delete(`/api/orders?orderName=${order.orderName}`);
    if (response.data.status === "SUCCESS") {
      toast.success(`Order "${orderName}" deleted`);
      setHeldOrders((prev) => prev.filter((o) => o.orderName !== orderName));
      setHeldOrdersOpen(false)
    } else {
      toast.error("Failed to delete order");
    }
  } catch (err) {
    console.error(err);
    toast.error("Failed to delete order");
  }
  }}
>
                <Trash2 size={16} />
              </button>

              {/* Order name */}
              <div className="mb-2">
                <h6 className="text-[0.75rem] text-[#c9184a]">Hold Name:</h6>
                <p className="font-semibold text-lg text-[#086d59]">
                  {order.orderName}
                </p>
              </div>

              {/* Items count and time */}
              <p className="text-sm text-gray-600 mb-3">
                {order.items.length} items •{" "}
                {new Date(order.createdAt).toLocaleTimeString()}
              </p>

              {/* Restore hint */}
              <div className="flex justify-between items-center text-[0.75rem] text-black/50 mb-2">
                <span>Click this order to restore</span>
                <LockIcon size={12} className="text-red-700" />
              </div>

              {/* Click to restore */}
             <div
  className="absolute inset-0 z-0"
  onClick={async () => {
    const restoredItems = order.items.map((i) => ({
      stock_id: i.stock_id,
      name: i.name,
      description: i.description,
      price: i.price,
      units: i.units,
      category_id: i.category_id,
      category_name: i.category_name,
    }));

    setSelectedItems(restoredItems);
    setHeldOrdersOpen(false);
    toast.success(`Order "${order.orderName}" restored`);

    try {
      const response = await axios.patch(
        `/api/orders?orderName=${encodeURIComponent(order.orderName)}`
      );
      if (response.data.status === 200) {
        toast.success("Status Updated!");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error Updating Status");
    }
  }}
/>

            </div>

          ))}
        </div>
      )}
    </div>
  </div>
)}





    </div>
  );
}

export default Posdisplaypanem;