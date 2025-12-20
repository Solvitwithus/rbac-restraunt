"use client"
import React from 'react'
import Menu from '../components/posmenu'
import { usePermissions } from '../stores/useAuth'
function page() {
    const {permissions} = usePermissions()
  return (
    <div>
        <Menu/>
        {permissions.seeButtonOne && (
  <button>Create Order</button>
)}

{permissions.seeButtonTwo && (
  <button>Delete Order</button>
)}
    </div>
  )
}

export default page