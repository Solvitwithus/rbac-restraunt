import React from 'react'
import Payments from '../components/payments'
import Menu from '../components/posmenu'

function Page() {
  return (
    <div className="min-h-screen overflow-y-auto  bg-[#F7F5EE]">
      <Menu/>
        <Payments/>
    </div>
  )
}

export default Page