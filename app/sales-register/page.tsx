// app/page.tsx or wherever your Page is
import React from 'react';
import Menu from '../components/posmenu';
import Posdisplaypanem from '../components/pos-display-panel';
import Posregisteritemsection from '../components/pos-registration-item-section';
import { AutoLogout } from '../components/autoLogout';
function Page() {
  return (
  <div className="min-h-screen h-fit sm:h-auto overflow-y-auto min-w-min bg-[#F7F5EE]">

  <Menu />
  <div className="flex my-4 gap-1 mx-2">
    <AutoLogout/>
    <Posdisplaypanem />
    <Posregisteritemsection />
  </div>
</div>

  );
}

export default Page;




