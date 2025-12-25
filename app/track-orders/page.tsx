
import React from 'react';



import MonitorOrders from '../components/monitorOrders';
import Menu from '../components/posmenu';

function Page() {
  return (
<div className="h-screen max-h-full overflow-y-auto min-w-min bg-[#F7F5EE]">
  <Menu />
<MonitorOrders/>
</div>

  );
}

export default Page;