
import React from 'react';



import MonitorOrders from '../components/monitorOrders';
import Menu from '../components/posmenu';

function Page() {
  return (
 <div className="min-h-screen h-fit sm:h-auto overflow-y-auto min-w-min bg-[#F7F5EE]">
  <Menu />
<MonitorOrders/>
</div>

  );
}

export default Page;