"use client"
import React, { useEffect } from 'react'
import Menu from '../components/posmenu'
import { toast } from 'sonner'

function Page() {

  useEffect(() => {
  const intervalId = setInterval(() => {
    toast.success("Feature coming soon: Chef to prepare meal from scratch!");
  }, 1000); // Every 10 seconds

  return () => clearInterval(intervalId);
}, []);
  return (
    <div className="min-h-screen overflow-y-auto  bg-[#F7F5EE]">
      <Menu />
      order-display</div>
  )
}

export default Page