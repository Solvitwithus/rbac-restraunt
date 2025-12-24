"use client";

import React, { useEffect, useState } from "react";
import RegisterIcon from "@/public/homeIcon.svg";
import ReportIcon from "@/public/report.svg";
import DisplayIcon from "@/public/kitchen.svg";
import Image from "next/image";
import {Permissions, Render, StaffMember, StaffResponse} from "./types"
import { StaffMembers } from "../hooks/access";
const menuItems = [
  { name: "Sales Register", icon: RegisterIcon, permission: "salesRegister" },
  { name: "Order Display", icon: DisplayIcon, permission: "orderDisplay" },
  { name: "Menu List", icon: DisplayIcon, permission: "menuList" },
  { name: "Reports", icon: ReportIcon, permission: "reports" },
  { name: "Wine Display", icon: ReportIcon, permission: "wineDisplay" },
  { name: "Kitchen Display", icon: ReportIcon, permission: "kitchenDisplay" },
];

import { useInternalHooks } from "../hooks/internal";
import { toast } from "sonner";

function Perms() {
    const {createRole} = useInternalHooks()
  const [roleName, setRoleName] = useState<string>("");
  const [selectedMember, setSelectedMember] = useState<string>("")
const [staffResponse, setStaffResponse] = useState<StaffResponse>({
  total_staff: 0,
  staff: [],
});

  const [permissions, setPermissions] = useState<Permissions>({
    salesRegister: false,
    orderDisplay: false,
    reports: false,
    wineDisplay:false,
  kitchenDisplay:false,
  menuList:false
  });


const [buttonPerm, setButtonPerm] = useState<Render>({
  placeOrder: false,
  holdOrder: false,
   LoadHeldOrders: false,
  payments: false,
  trackOrder:false,
  takeOrder:false,
  viewMenu:false,
  totalPlusActionButtons:false
});

const handleButtonPermChange = (key: keyof Render) => {
  setButtonPerm((prev) => ({
    ...prev,
    [key]: !prev[key],
  }));
};


  // Handle individual checkbox change
  const handlePermissionChange = (permissionKey: keyof Permissions) => {
    setPermissions((prev) => ({
      ...prev,
      [permissionKey]: !prev[permissionKey],
    }));
  };

  useEffect(() => {
  const fetchStaff = async () => {
    const res = await StaffMembers();
    if (res) setStaffResponse(res);
  };
  fetchStaff();
}, []);
console.log("staff",staffResponse);

  // Optional: Handle form submission (send to backend)
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!roleName.trim()) {
    toast.warning("Please enter a role name");
    return;
  }

  if (!selectedMember) {
    toast.warning("Please select a staff member");
    return;
  }

 const payload = {
  roleName: roleName.trim(),
  permissions: {
    ...permissions,
    ...buttonPerm,
  },
  staffId: selectedMember,
};


  try {
    const result = await createRole(payload);
if ("error" in result) {
  toast.error(result.error.error || result.error || "Failed to create role");
  console.error("Role creation failed:", result.error);
} else {
  console.log("Role created successfully:", result);
  toast.success("Role created successfully!");
  // reset form...
   setRoleName("");
    setSelectedMember("");
    setPermissions({
      salesRegister: false,
      orderDisplay: false,
      reports: false,
      wineDisplay:false,
      kitchenDisplay:false,
 menuList:false,
 totalPlusActionButtons:false
    });
}



    // Optional: Reset form
   
  } catch (error) {
    console.error("Failed to create role:", error);
    toast.error("Failed to create role. Check console for details.");
  }
};

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">

        <div>

 <select
  value={selectedMember}
  onChange={(e) => setSelectedMember(e.target.value)}
  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
>
  <option value="">Select Staff</option>
  {staffResponse?.staff.map((member) => (
   <option value={member.id} key={member.id}>
  {member.real_name}
</option>

  ))}
</select>

</div>
      <h2 className="text-2xl font-bold mb-6">Create New Role</h2>

      <form onSubmit={handleSubmit}>
        {/* Role Name Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role Name
          </label>
          <input
            type="text"
            placeholder="e.g., Manager, Waiter, Admin"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Permissions Checkboxes */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Permissions</h3>
          <div className="space-y-3">
            {menuItems.map((item) => (
              <label
                key={item.permission}
                className="flex items-center space-x-3 cursor-pointer text-black"
              >
                <input
                  type="checkbox"
                  checked={permissions[item.permission as keyof Permissions]}
                  onChange={() =>
                    handlePermissionChange(item.permission as keyof Permissions)
                  }
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <Image src={item.icon} height={6} width={6} alt="woi"/>
               
                <span className="select-none">{item.name}</span>
              </label>
            ))}
          </div>


         <div className="space-y-3">
  <label className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={buttonPerm.LoadHeldOrders}
      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
      onChange={() => handleButtonPermChange("LoadHeldOrders")}
    />
   Load Held Orders
  </label>

   <label className="flex items-center gap-2">
    <input
      type="checkbox"
      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
      checked={buttonPerm.holdOrder}
      onChange={() => handleButtonPermChange("holdOrder")}
    />
   Hold Orders
  </label>

   <label className="flex items-center gap-2">
    <input
      type="checkbox"
      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
      checked={buttonPerm.payments}
      onChange={() => handleButtonPermChange("payments")}
    />
   Payments Processing
  </label>

   <label className="flex items-center gap-2">
    <input
      type="checkbox"
      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
      checked={buttonPerm.placeOrder}
      onChange={() => handleButtonPermChange("placeOrder")}
    />
  Place Orders
  </label>
     <label className="flex items-center gap-2">
    <input
      type="checkbox"
      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
      checked={buttonPerm.trackOrder}
      onChange={() => handleButtonPermChange("trackOrder")}
    />
   Track Orders
  </label>
       <label className="flex items-center gap-2">
    <input
      type="checkbox"
      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
      checked={buttonPerm.takeOrder}
      onChange={() => handleButtonPermChange("takeOrder")}
    />
   Take Orders
  </label>

        <label className="flex items-center gap-2">
    <input
      type="checkbox"
      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
      checked={buttonPerm.viewMenu}
      onChange={() => handleButtonPermChange("viewMenu")}
    />
   View Menu
  </label>

 <label className="flex items-center gap-2">
    <input
      type="checkbox"
      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
      checked={buttonPerm.totalPlusActionButtons}
      onChange={() => handleButtonPermChange("totalPlusActionButtons")}
    />
   View Totals and Associated Action Buttons
  </label>
</div>

        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition duration-200"
        >
          Create Role
        </button>
      </form>

      {/* Debug: Show current state */}
      <div className="mt-8 p-4 bg-red-100 rounded text-sm">
        <p className="font-mono">Current payload:</p>
        <pre className="mt-2 text-xs">
          {JSON.stringify({ roleName, permissions }, null, 2)}
        </pre>
      </div>


      

 
    </div>
  );
}

export default Perms;