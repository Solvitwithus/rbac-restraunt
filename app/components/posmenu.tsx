"use client"
// components/dasrestaurosch/posmenu.tsx
// das restaurosch is actually german to mean the hotel, das is one of the killer articles of german. now read the comment to understand the basic map function that your lazy lecture never bothered to explain!!!!!


/**
 * =============================================================================
 * POS Top Navigation Menu Bar
 * =============================================================================
 *
 * @file components/dasrestaurosch/posmenu.tsx
 * @author John Kamiru Mwangi
 *@date Dec3 2025
 * @description
 *   Sticky top navigation bar used across the DigiSales POS application.
 *   Provides quick access to core modules and system actions (Logout / Exit).
 *
 *   This component appears on every authenticated POS page and serves as the
 *   primary navigation hub for cashiers, managers, and kitchen staff.
 *
 * @features
 *   • Horizontal scrolling menu (mobile-friendly)
 *   • Active route highlighting with distinct color (#099c7f)
 *   • SVG icon + label for each module
 *   • Clean logout with full session cleanup
 *   • Graceful "Exit" action redirecting to external landing/homepage
 *   • Sticky positioning with subtle bottom shadow and scroll indicator
 *
 * @navigationItems
 *   - Sales Register     → /sales-register      (Main POS interface)
 *   - Stock List         → /stock-list          (Inventory overview)
 *   - Kitchen Display    → /kitchen-display     (KDS for cooks)
 *   - Reports            → /reports             (Sales, shifts, analytics)
 *
 * @keyHooks
 *   - usePathname()      → Detects current route for active styling
 *   - useRouter()        → Programmatic navigation (used in Exit)
 *   - useLoginSession()  → Access to clearToken() & clearUsers() for secure logout
 *
 * @securityNotes
 *   • Logout: clears Zustand store + removes localStorage "login-session"
 *   • Exit:   redirects to external URL defined in .env (NEXT_PUBLIC_EXIT_URL)
 *             useful for kiosk mode or embedded systems
 *
 * @stylingHighlights
 *   • Fully responsive: works on tablets and narrow screens via overflow-x-auto
 *   • Color scheme follows brand:
 *        - Primary accent:   #c9184a  (error/red)
 *        - Success/active:   #099c7f
 *        - Neutral text:     #4B2E26
 *        - Background:       #F6EFE7 (warm off-white)
 *
 * @futureImprovements / TODOs
 *   • Add user avatar + dropdown (profile, switch user, settings)
 *   • Role-based menu filtering (e.g., hide Reports for cashiers)
 *   • Notifications bell with badge (new orders, low stock alerts)
 *   • Shift status indicator (e.g., "Shift Active – John Doe")
 *   • Dark mode toggle
 *   • Keyboard navigation support (arrow keys + Enter)
 *   • Animate active indicator underline
 *
 * @environmentVariables
 *   NEXT_PUBLIC_EXIT_URL → Full URL to redirect on "Exit" (e.g., company homepage or kiosk lobby)
 *
 * =============================================================================
 */

"use client";

import React, { useState, useEffect } from "react";
import Kitchen from "@/public/kitchen.svg";
import Report from "@/public/report.svg";
import HomeIcon from "@/public/homeIcon.svg";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLoginSession,usePermissions } from "../stores/useAuth";

import { Menu as MenuIcon, X } from "lucide-react";
import { toast } from "sonner";

interface LandingPage {
  name: string;
  path: string;
  icon: any;
  key: string; // "salesRegister" | "orderDisplay" | "reports"
}

function Menu() {
  const { clearToken, clearUsers } = useLoginSession();
  const { permissions } = usePermissions(); // Get permissions from store
  const currentPath = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Define all possible menu items
const allDisplayPanel: LandingPage[] = [
  { name: "Sales Register", path: "/sales-register", icon: HomeIcon, key: "salesRegister" },
  { name: "Menu List", path: "/stock-list", icon: Kitchen, key: "orderDisplay" },
  { name: "Reports", path: "/reports", icon: Report, key: "reports" },
  { name: "wine Display", path: "/reports", icon: Report, key: "wineDisplay" },
  
];

const displayPanel = allDisplayPanel.filter(
  (item) => permissions[item.key as keyof Permissions] === true
);
  const logout = () => {
    clearToken();
    clearUsers();
    localStorage.removeItem("login-session");
    router.push("/");
  };

  // Optional: Redirect if no permissions (e.g., to dashboard or error)
  useEffect(() => {
    if (Object.values(permissions).every((p) => !p)) {
      toast.error("No access permissions assigned. Contact admin.");
      router.push("/dashboard"); // or wherever
    }
  }, [permissions, router]);

  return (
    <header className="w-full bg-[#F6EFE7] border-b shadow-sm sticky top-0 z-50">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2">
        {/* Brand */}
        <div>
          <h5 className="text-[#c9184a] font-black text-xl">Digisales POS</h5>
          <p className="text-gray-900 text-xs">Sand-Box</p>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-8">
          {displayPanel.map((val) => (
            <Link
              key={val.name}
              href={val.path}
              className={`flex items-center gap-2 transition-colors
                ${currentPath === val.path
                  ? "text-[#099c7f] font-semibold"
                  : "text-[#4B2E26] hover:text-[#c9184a]"}`}
            >
              <Image src={val.icon} width={24} height={24} alt={val.name} />
              <span className="text-sm">{val.name}</span>
            </Link>
          ))}
          {displayPanel.length === 0 && (
            <span className="text-gray-500 text-sm">No menu access</span>
          )}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-6">
          <button
            onClick={logout}
            className="text-red-600 hover:underline text-sm font-medium"
          >
            Log Out
          </button>

          <Link
            href={process.env.NEXT_PUBLIC_EXIT_URL as string}
            className="text-gray-600 hover:underline text-sm font-medium"
          >
            Exit
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-[#4B2E26]"
        >
          {open ? <X size={26} /> : <MenuIcon size={26} />}
        </button>
      </div>

      {open && (
        <div
          className="
            md:hidden
            fixed
            top-[64px]
            left-0
            w-full
            bg-[#F6EFE7]
            border-t
            shadow-lg
            z-50
          "
        >
          <div className="flex flex-col divide-y">
            {displayPanel.map((val) => (
              <Link
                key={val.name}
                href={val.path}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-4 text-sm
                  ${currentPath === val.path
                    ? "bg-[#efe6db] text-[#099c7f] font-semibold"
                    : "text-[#4B2E26] hover:bg-[#efe6db]"}`}
              >
                <Image src={val.icon} width={22} height={22} alt={val.name} />
                {val.name}
              </Link>
            ))}

            {displayPanel.length === 0 && (
              <div className="px-4 py-4 text-sm text-gray-500">
                No menu access
              </div>
            )}

            <button
              onClick={logout}
              className="px-4 py-4 text-right text-red-600 text-sm hover:bg-[#efe6db]"
            >
              Log Out
            </button>

            <Link
              href={process.env.NEXT_PUBLIC_EXIT_URL as string}
              className="px-4 py-4 text-right text-gray-600 text-sm hover:bg-[#efe6db]"
            >
              Exit
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default Menu;