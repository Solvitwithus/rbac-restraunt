"use client";
import React, { useEffect, useState } from "react";
import Menu from "./posmenu";
import { GetAllActiveSessions, GetPerSessionOrders } from "../hooks/access";
import { DiningSessionDTO, OrderDTO } from "./types";

function Payments() {
  const [activeSessions, setActiveSessions] = useState<DiningSessionDTO[]>([])
  const [perSessionOrders, setperSessionOrders] = useState<OrderDTO[]>([])
  const [loadActiveSessions, setloadActiveSessions] = useState(false)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
const [ordersLoading, setOrdersLoading] = useState(false);
  useEffect(()=>{
    
  const fetchSessions= async()=>{
    try{
const res = await GetAllActiveSessions()
setActiveSessions(res.sessions)
}
catch(e:unknown){
  console.log(e);
  
}
  }
  fetchSessions()
  },[])


  const handleSessionOrdersDisplay = async (id: string) => {
  try {
    setOrdersLoading(true);
    setSelectedSessionId(id);

    const res = await GetPerSessionOrders({ session_id: id });
    setperSessionOrders(res.orders);
  } catch (e) {
    console.log(e);
  } finally {
    setOrdersLoading(false);
  }
};

  return (
    <div className="min-h-screen overflow-y-auto  bg-[#F7F5EE]">
<Menu/>
<div className="flex w-full">
<div className=" flex w-[80%]">
  <div className="w-[20%] p-2">
    <input type="text" className="w-full border border-black placeholder:text-amber-700" placeholder="Search Transaction"/>
    <h4>Transaction History</h4>

  </div>
 <div className="overflow-x-auto w-full">
  <div>
  
<p className="p-3 bg-amber-800" onClick={()=>setloadActiveSessions(true)}>Load Transactions</p>
{loadActiveSessions && (
  <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center">
    <div className="bg-white w-[90%] max-w-5xl rounded-2xl shadow-xl p-4">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Active Sessions</h2>
        <button
          onClick={() => setloadActiveSessions(false)}
          className="text-sm px-3 py-1 rounded-lg bg-black/5 hover:bg-black/10"
        >
          Close
        </button>
      </div>

      {/* Table */}
      <div className="overflow-y-auto max-h-[65vh]">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-black/5">
            <tr>
              <th className="px-3 py-2 text-left">Table</th>
              <th className="px-3 py-2 text-left">Guests</th>
              <th className="px-3 py-2 text-left">Started</th>
              <th className="px-3 py-2 text-left">Duration</th>
              <th className="px-3 py-2 text-right">Total</th>
              <th className="px-3 py-2 text-center">Status</th>
            </tr>
          </thead>

         <tbody>
  {activeSessions.map((session) => (
    <React.Fragment key={session.session_id}>
      {/* SESSION ROW */}
      <tr
        className="border-b hover:bg-black/5 cursor-pointer transition"
        onClick={() => handleSessionOrdersDisplay(session.session_id)}
      >
        <td className="px-3 py-2">
          <div className="font-medium">{session.table_name}</div>
          <div className="text-xs text-black/50">
            #{session.table_number}
          </div>
        </td>

        <td className="px-3 py-2">{session.guest_count}</td>

        <td className="px-3 py-2">
          {new Date(session.start_time).toLocaleTimeString("en-KE", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </td>

        <td className="px-3 py-2">
          {session.duration_formatted}
        </td>

        <td className="px-3 py-2 text-right font-semibold">
          Ksh {Number(session.total_amount).toFixed(2)}
        </td>

        <td className="px-3 py-2 text-center">
          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
            Active
          </span>
        </td>
      </tr>

      {/* ORDERS ROW (only for selected session) */}
      {selectedSessionId === session.session_id && (
        <tr className="bg-black/3">
          <td colSpan={6} className="px-4 py-3">
            {ordersLoading ? (
              <p className="text-sm text-black/40">Loading orders…</p>
            ) : perSessionOrders.length === 0 ? (
              <p className="text-sm text-black/40">No orders</p>
            ) : (
              <table className="w-full text-sm border rounded-lg overflow-hidden">
                <thead className="bg-black/5">
                  <tr>
                    <th className="px-2 py-1 text-left">Item</th>
                    <th className="px-2 py-1 text-center">Qty</th>
                    <th className="px-2 py-1 text-right">Price</th>
                    <th className="px-2 py-1 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {perSessionOrders.map((order) => (
                    <tr key={order.id} className="border-t">
                      <td className="px-2 py-1">
                        {order.item_description}
                      </td>
                      <td className="px-2 py-1 text-center">
                        {Number(order.quantity)}
                      </td>
                      <td className="px-2 py-1 text-right">
                        Ksh {Number(order.unit_price).toFixed(2)}
                      </td>
                      <td className="px-2 py-1 text-right font-medium">
                        Ksh {order.line_total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </td>
        </tr>
      )}
    </React.Fragment>
  ))}
</tbody>

        </table>

        {activeSessions.length === 0 && (
          <p className="text-center py-10 text-black/40">
            No active sessions
          </p>
        )}
      </div>
      {
        activeSessions.length >=1 && (
          <div className="w-full flex justify-between bg-amber-700 text-black font-bold">
  <button type="button">Add to Cart</button>
  <button type="button">Cancel</button>
</div>
        )
      }
    </div>
  </div>
)}

  </div>
            <table className="w-full text-sm">
              <thead className="bg-black/5 text-left">
                <tr>
                  <th className="px-3 py-2">Product</th>
                  <th className="px-3 py-2">Qty</th>
                  <th className="px-3 py-2">Price</th>
                  <th className="px-3 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    colSpan={4}
                    className="py-10 text-center text-black/40"
                  >
                    No transactions yet
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
</div>
       <div className="w-[20%]">
        <input type="text" placeholder="Name" className="w-[90%] placeholder-black/30 rounded-xl text-black/40 border mb-1 border-black/30 px-1 py-2"/>
         <input type="text" placeholder="KRA Pin" className="w-[90%] placeholder-black/30 rounded-xl text-black/40 border mb-1 border-black/30 px-1 py-2"/>
         <button type="button" className="w-[90%] mb-2 bg-[#c9184a] py-2 rounded-xl text-white font-bold text-[1rem]">process</button>

         <table className="w-[90%]">
          <tbody>
            <tr className="border-b border-black/25 mb-5">
              <td>Total</td>
              <td className="text-right">Ksh 0</td>
            </tr>
             <tr className="border-b border-black/25">
              <td>Paid</td>
              <td className="text-right">Ksh 0</td>
            </tr>
             <tr className="border-b border-black/25">
              <td>Balance</td>
              <td className="text-right">Ksh 0</td>
            </tr>
          </tbody>
         </table>

         <p className="text-black mb-2 text-[1.14rem] font-extrabold">Customer</p>
         <input type="text" placeholder="Cash Sale" className="w-[90%] placeholder-black/30 rounded-xl text-black/40 border mb-1 border-black/35 px-1 py-2"/>
         <p className="text-black mb-2 text-[0.9rem] font-medium">Pricing Mode:</p>
         <button type="button" className="w-[90%] mb-2 bg-[#fffbff] border border-black/20 text-left py-2 rounded-xl text-black/30 font-light pl-2 text-[1rem]">Cash</button>
          <button type="button" className="w-[90%] mb-2 bg-[#fffbff] border border-black/20 text-left py-2 rounded-xl text-black/30 font-light pl-2 text-[1rem]">Mpesa</button>
           <button type="button" className="w-[90%] mb-2 bg-[#fffbff] border border-black/20 text-left py-2 rounded-xl text-black/30 font-light pl-2 text-[1rem]">Family Bank</button>
            <button type="button" className="w-[90%] mb-2 bg-[#fffbff] border border-black/20 text-left py-2 rounded-xl text-black/30 font-light pl-2 text-[1rem]">Manual Bank</button>
      </div>

      {/* {paymentsmainmodal && (
        <div className="fixed inset-0 bg-black/50 z-9999 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <p className="text-black">payments logics will be implemented here</p>
          </div>
          <button type="button" className="bg-amber-400 p-3" onClick={()=>{
            setpaymentsmainmodal(false)
            window.location.reload()
          }}>close</button>
        </div>
      )} */}
      </div>
    </div>
  );
}

export default Payments;
