
import React from 'react';

import Menu from '../components/posmenu';
import KitchenStatus from '../components/kitchenStatusUpdate';


function Page() {
  return (
  <div className="min-h-screen overflow-y-auto min-w-min bg-[#F7F5EE]">
  <Menu />
<KitchenStatus/>
</div>

  );
}

export default Page;