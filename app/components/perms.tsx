"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Permissions, Render, StaffResponse } from "./types";
import { StaffMembers } from "../hooks/access";
import { useInternalHooks } from "../hooks/internal";
import { toast } from "sonner";
import OurMenu from "@/public/download (1).svg"
import KitchenTrack from "@/public/kds.svg"
import Wine from "@/public/wine.svg"

import RegisterIcon from "@/public/homeIcon.svg";
import ReportIcon from "@/public/report.svg";
import DisplayIcon from "@/public/kitchen.svg";
import { User, Shield, CheckCircle2, Loader2 } from "lucide-react";

const menuItems = [
  { name: "Sales Register", icon: RegisterIcon, permission: "salesRegister" },
  { name: "Chef's Module", icon: DisplayIcon, permission: "orderDisplay" },
  { name: "Menu List", icon: OurMenu, permission: "menuList" },
  { name: "Reports", icon: ReportIcon, permission: "reports" },
  { name: "Wine Display", icon: Wine, permission: "wineDisplay" },
  { name: "Kitchen Display", icon: KitchenTrack, permission: "kitchenDisplay" },
];

const buttonPermissions = [
  { key: "placeOrder", label: "Place Orders", desc: "Convert cart items to confirmed orders" },
  { key: "holdOrder", label: "Hold Orders", desc: "Temporarily save incomplete orders" },
  { key: "LoadHeldOrders", label: "Load Held Orders", desc: "Retrieve previously held orders" },
  { key: "payments", label: "Process Payments", desc: "Handle payment processing" },
  { key: "trackOrder", label: "Track Orders", desc: "Monitor created orders" },
  { key: "takeOrder", label: "Take Orders", desc: "Add items to cart via search" },
  { key: "viewMenu", label: "View Menu", desc: "Browse and add menu items to cart" },
  { key: "totalPlusActionButtons", label: "View Totals & Actions", desc: "Show cart total and action buttons panel" },
];

function Perms() {
  const { createRole } = useInternalHooks();
  const [roleName, setRoleName] = useState("");
  const [selectedMember, setSelectedMember] = useState("");
  const [loading, setLoading] = useState(false);

  const [staffResponse, setStaffResponse] = useState<StaffResponse>({
    total_staff: 0,
    staff: [],
  });

  const [permissions, setPermissions] = useState<Permissions>({
    salesRegister: false,
    orderDisplay: false,
    reports: false,
    wineDisplay: false,
    kitchenDisplay: false,
    menuList: false,
  });

  const [buttonPerm, setButtonPerm] = useState<Render>({
    placeOrder: false,
    holdOrder: false,
    LoadHeldOrders: false,
    payments: false,
    trackOrder: false,
    takeOrder: false,
    viewMenu: false,
    totalPlusActionButtons: false,
  });

  const handlePermissionChange = (key: keyof Permissions) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleButtonPermChange = (key: keyof Render) => {
    setButtonPerm((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    const fetchStaff = async () => {
      const res = await StaffMembers();
      if (res) setStaffResponse(res);
    };
    fetchStaff();
  }, []);

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

    setLoading(true);

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
        toast.error(result.error.error || "Failed to create role");
      } else {
        toast.success("Role created successfully!");
        // Reset form
        setRoleName("");
        setSelectedMember("");
        setPermissions({
          salesRegister: false,
          orderDisplay: false,
          reports: false,
          wineDisplay: false,
          kitchenDisplay: false,
          menuList: false,
        });
        setButtonPerm({
          placeOrder: false,
          holdOrder: false,
          LoadHeldOrders: false,
          payments: false,
          trackOrder: false,
          takeOrder: false,
          viewMenu: false,
          totalPlusActionButtons: false,
        });
      }
    } catch (error) {
      toast.error("Failed to create role");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="sm:w-full md:max-w-2/3 mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-pink-600 via-[#c9184a] to-red-600 px-8 py-10 text-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Create Staff Role</h1>
                <p className="text-blue-100 mt-1">Assign permissions to team members</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Staff Member Select */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <User className="inline w-4 h-4 mr-1" />
                  Assign to Staff Member
                </label>
                <select
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition"
                  required
                >
                  <option value="">Choose a staff member...</option>
                  {staffResponse?.staff.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.real_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Role Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Head Waiter, Bar Manager, Kitchen Lead"
                  value={roleName}
                  autoFocus
                  onChange={(e) => setRoleName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition"
                  required
                />
              </div>

              {/* Module Access Permissions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#c9184a]" />
                  Module Access
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {menuItems.map((item) => (
                    <label
                      key={item.permission}
                      className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={permissions[item.permission as keyof Permissions]}
                        onChange={() => handlePermissionChange(item.permission as keyof Permissions)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Image src={item.icon} alt={item.name} width={24} height={24} />
                        </div>
                        <span className="font-medium text-gray-800">{item.name}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Button/Action Permissions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#c9184a]" />
                  Action Permissions
                </h3>
                <div className="space-y-3">
                  {buttonPermissions.map(({ key, label, desc }) => (
                    <label
                      key={key}
                      className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={buttonPerm[key as keyof Render]}
                        onChange={() => handleButtonPermChange(key as keyof Render)}
                        className="w-5 h-5 mt-0.5 text-blue-600 rounded focus:ring-blue-500 flex-shrink-0"
                      />
                      <div>
                        <div className="font-medium text-gray-800">{label}</div>
                        <div className="text-sm text-gray-500 mt-1">{desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50 transform transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Role...
                  </>
                ) : (
                  "Create Role"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Optional: Footer note */}
        <p className="text-center text-sm text-gray-500 mt-8">
          Permissions control access to modules and actions across the system.
        </p>
      </div>
    </div>
  );
}

export default Perms;