import React from 'react'
import Menu from '../components/posmenu'
import Tables from '../components/tables'

function Page() {
  return (
    <div className="min-h-screen overflow-y-auto min-w-min bg-[#F7F5EE]">
    <Menu/>
    <Tables/>
    </div>
  )
}

export default Page