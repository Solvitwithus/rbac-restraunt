
import React from 'react';

import Menu from '../components/posmenu';
import WinerySection from '../components/wineryStatusUpdate';


function Page() {
  return (
  <div className="min-h-screen overflow-y-auto min-w-min bg-[#F7F5EE]">
  <Menu />
<WinerySection/>
</div>

  );
}

export default Page;