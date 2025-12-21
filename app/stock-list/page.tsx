import React from 'react'
import Menu from '../components/posmenu'
import ItemInventory from '../components/itemsandInventory'

function Page() {
  return (
    <div className="min-h-screen overflow-y-auto  bg-[#F7F5EE]">
      <Menu />
      <ItemInventory/>
      </div>
  )
}

export default Page