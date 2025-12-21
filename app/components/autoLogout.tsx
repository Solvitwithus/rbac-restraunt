"use client";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useLoginSession } from "@/app/stores/useAuth";
import { useRouter } from "next/navigation";

export const AutoLogout = () => {
  const { clearSession } = useLoginSession();
  const router = useRouter();

  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const logoutTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimers = () => {
    // Clear existing timers
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (logoutTimeoutRef.current) clearTimeout(logoutTimeoutRef.current);

    // Warning at 55 min
    warningTimeoutRef.current = setTimeout(() => {
      toast.warning("You will be logged out in 5 minutes due to inactivity.", {
        duration: 5000,
      });
    }, 55 * 60 * 1000);

    // Logout at 60 min
    logoutTimeoutRef.current = setTimeout(() => {
      clearSession();
      router.push("/");
      toast.warning("You have been logged out due to inactivity.", { duration: 5000 });
    }, 60 * 60 * 1000);
  };

  useEffect(() => {
    // Start timers initially
    resetTimers();

    // Reset timers on user activity
    const events = ["mousemove", "mousedown", "keydown", "touchstart"];
    const handleActivity = () => resetTimers();

    events.forEach((e) => window.addEventListener(e, handleActivity));

    // Cleanup on unmount
    return () => {
      events.forEach((e) => window.removeEventListener(e, handleActivity));
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (logoutTimeoutRef.current) clearTimeout(logoutTimeoutRef.current);
    };
  }, [clearSession, router]);

  return null;
};
