"use client";

/**
 * @author John Kamiru
 *
 * LoginCard Component
 * -------------------
 * This component is responsible for handling the login process for DigiSales.
 * It provides:
 *
 * 1. User Authentication
 *    - Accepts username and password.
 *    - Validates empty fields before submitting.
 *    - Sends credentials to the `Login()` API helper.
 *    - Stores returned token and user object inside the global `useLoginSession` store.
 *
 * 2. Redirect Logic
 *    - Automatically redirects authenticated users to `/sales-register`.
 *    - Prevents showing the login page if a valid token already exists.
 *
 * 3. UI & Animation
 *    - Uses the `ShineBorder` and `TypingAnimation` components for branding.
 *    - Styled with Tailwind classes following the DigiSales color theme.
 *
 * 4. Error Handling
 *    - Shows toast notifications for invalid credentials or unexpected errors.
 *    - Displays loading state on the login button to prevent duplicate submissions.
 *
 * HOW TO EXTEND THIS FILE:
 * ------------------------
 * - To add "Remember Me", multi-role login, or OTP verification,
 *   extend the `handleLogin` function and update the global auth store.
 *
 * - If API login logic changes, update the `Login()` function in:
 *      /app/hooks/access.ts
 *
 * - Global state for the authenticated user is stored in:
 *      /app/store/useAuth.ts
 *
 * - If routes change, update the redirect path inside the `useEffect()` and
 *   the success handler within `handleLogin()`.
 *
 * Last Updated: 2025
 */

import { Login } from "@/app/hooks/access";
import { ShineBorder } from "@/components/ui/shine-border";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LoginResponse, useLoginSession,usePermissions } from "../stores/useAuth";

import { useInternalHooks } from "../hooks/internal";
import { apiPermissionsToObject } from "@/lib/permissionUtils";
import { Role } from "./types";

export default function LoginCard() {
  const router = useRouter();
  const {setPermissions} = usePermissions()
const {token,clearSession,setSession,} = useLoginSession()

const {fetchRoles} = useInternalHooks()
  const [userName, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState(false)



  // useEffect(() => {
  //   if (token) router.push("/sales-register");
  // }, [token, router]);
    useEffect(() => {
    if (localStorage.getItem("login-session")) {
      toast.info("Auto login")
      router.push("/sales-register");
    }
    
  }, [ router]);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "username") setUserName(value);
    if (name === "password") setPassword(value);
  };

// const handleLogin = async (e?: React.FormEvent) => {
//   e?.preventDefault();
//   try {
//     setLoading(true);

//     if (!userName || !password) {
//       toast.error("Please enter all credentials");
//       return;
//     }


//     const res = await Login(userName, password) as LoginResponse;;
// console.log("res",res);

//     if (res) {

//       // Fetch the user's role + permissions
//       const rolesResponse = await fetchRoles(res.id); 

      

//       let rolesArray: Role[];
//  setSession(res)
//       if (rolesResponse.role) {
//         // single role response: { role: { ... } }
//         rolesArray = [rolesResponse.role];
//       } else if (rolesResponse.roles) {
//         // multiple roles: { roles: [...] }
//         rolesArray = rolesResponse.roles;
//       }
      
     
//       else {
//         console.warn("Unexpected roles response format", rolesResponse);
//         rolesArray = [];
//       }
// toast.error("failed")
//       console.log("Fetched roles:", rolesArray);

//       // Convert to the shape your app uses
//       const uiPermissions = apiPermissionsToObject(rolesArray);
// console.log("ui",uiPermissions);

//       // Save to Zustand store
//      setPermissions(uiPermissions);

//       toast.success("Login successful!");
//       // redirect or whatever you do next

      
//       router.push("/sales-register")
//     }
//   } catch (error) {
//     console.error("Login error:", error);
//     toast.error("Unexpected error occurred! Please try again later.");
//   } finally {
//     setLoading(false);
//   }
// };


const handleLogin = async (e?: React.FormEvent) => {
  e?.preventDefault();
  try {
    setLoading(true);

    if (!userName || !password) {
      toast.error("Please enter all credentials");
      return;
    }

    // 1️⃣ Login
    const res = (await Login(userName, password)) as LoginResponse;
    if (!res) return;

    // 2️⃣ Fetch roles
    const rolesResponse = await fetchRoles(res.id);
    let rolesArray: Role[] = [];
setSession(res)
    if (rolesResponse.role) {
      rolesArray = [rolesResponse.role];
    } else if (rolesResponse.roles) {
      rolesArray = rolesResponse.roles;
    }

    // 3️⃣ Convert to UI permissions
    const uiPermissions = apiPermissionsToObject(rolesArray);
    setPermissions(uiPermissions);

    // 4️⃣ Map permissions to pages
    const pageMap: { [key: string]: string } = {
      salesRegister: "/sales-register",
      orderDisplay: "/order-display",
      reports: "/reports",
      wineDisplay: "/wine-display",
      kitchenDisplay: "/kitchen-display",
      menuList: "/stock-list",
    };

    // 5️⃣ Find first permission that is true
    const firstPage = Object.keys(pageMap).find(
      (perm) => uiPermissions[perm]
    );

    // 6️⃣ Redirect
    if (firstPage) {
      router.push(pageMap[firstPage]);
    } else {
      router.push("/"); // fallback page
    }

    toast.success("Login successful!");
  } catch (error) {
    console.error("Login error:", error);
    toast.error("Unexpected error occurred! Please try again later.");
  } finally {
    setLoading(false);
  }
};

  return (
  <div className="relative flex items-center justify-center min-h-screen bg-[#F6EFE7]">
    <span className="bg-[#E9D7C1] rounded-br-full h-52 w-52 absolute top-0 left-0"></span>
    <span className="bg-[#D4A373] rounded-tl-full h-52 w-52 absolute bottom-0 right-0"></span>

    <div className="relative sm:w-[45%] lg:w-[30%] bg-white rounded-xl shadow-lg p-6 flex flex-col items-center gap-4">
      <ShineBorder
        borderWidth={2}
        duration={10}
        shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
        className="rounded-xl"
      />

      <TypingAnimation
        words={["Digi-ERP POS"]}
        className="text-[#c9184a] text-2xl z-10 font-semibold"
        blinkCursor
        startOnView={false}
      />

      <h6 className="text-md text-[#D4A373]">
        Welcome Back!{" "}
        <span className="text-[#ddc09d]">Log in to Continue...</span>
      </h6>

      {/* 👇 FORM START */}
      <form onSubmit={handleLogin} className="flex flex-col gap-2 w-full mt-2">
        {/* Username */}
        <label className="text-right text-sm">User Name:</label>
        <input
          type="text"
          name="username"
          placeholder="Enter name"
          required
          value={userName}
          onChange={handleInputChange}
          className="border placeholder-black/70 text-black rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4A373]"
        />

        {/* Password */}
        <label className="text-right text-sm">Password:</label>
        <input
          type="password"
          name="password"
          required
          value={password}
          onChange={handleInputChange}
          placeholder="Password"
          className="border placeholder-black/70 text-black rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4A373]"
        />

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          className="bg-[#c9184a] mt-5 cursor-pointer font-bold text-white py-2 rounded-md hover:bg-[#b88658] transition"
        >
          {loading ? "Shift Starting" : "Start Shift"}
        </button>
      </form>
      {/* 👆 FORM END */}

      <h6 className="text-[0.8rem] text-black/45">
        Powered by:{" "}
        <span className="text-[#c9184a]/50">
          Digisoft Solutions Limited
        </span>
      </h6>
    </div>
  </div>
);

}
