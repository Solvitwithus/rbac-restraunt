import { create } from "zustand";
import { persist } from "zustand/middleware";

import { defaultPermissions, LoginSessionState, MenuItemsTypes,Permissions, ServerInfo} from "@/app/components/types"
export interface LoginResponse {
  status: "SUCCESS" | "ERROR";
  timestamp: string; // "YYYY-MM-DD HH:mm:ss"
  token: string;
  user: {
    id: string;
    username: string;
    name: string;
    role: string;
    store: string;
  };
}

export const useLoginSession = create<LoginSessionState>()(
  persist(
    (set) => ({
      token: null,
      user: null,

      setSession: (data) =>
        set({
          token: data.token,
          user: data.user,
        }),

      clearSession: () =>
        set({
          token: null,
          user: null,
        }),
    }),
    {
      name: "login-session",
    }
  )
);
interface SelectedItemsState {
  selectedItems: MenuItemsTypes[];
  setSelectedItems: (data: MenuItemsTypes[]) => void;
  clearSelectedItems: () => void;
}

export const useSelectedData = create<SelectedItemsState>()(
  persist(
    (set) => ({
      selectedItems: [],
      setSelectedItems: (data) => set({ selectedItems: data }),
      clearSelectedItems: () => set({ selectedItems: [] }),
    }),
    {
      name: "selected-items", // localStorage key
    }
  )
);





export interface SessionType {
  session_id: string;
  table_id: string;
  session_date: string;
  start_time: string;
  end_time: string | null;
  guest_count: string;
  status: string;
  total_amount: string;
  notes: string;
  created_by: string;
  session_type: string;
  table_number: string;
  table_name: string;
  capacity: string;
  duration_formatted: string;
  duration_minutes: number;
}

interface SessionUpdate {
  Sessions: SessionType[];
  SetSession: (data: SessionType[]) => void;
  clearSession: () => void;
}

export const useSessionData = create<SessionUpdate>()(
  persist(
    (set) => ({
      Sessions: [],
      SetSession: (data: SessionType[]) => set({ Sessions: data }),
      clearSession: () => set({ Sessions: [] }),
    }),
    {
      name: "session_data",
    }
  )
);


export interface OrderType {
  id: string;
  item_code: string;
  item_description: string;
  quantity: string;
  unit_price: string;
  status: string;
  order_time: string;
  line_total: number;
  notes:string;
}

interface OrderState {
  orders: OrderType[];
  setOrders: (data: OrderType[]) => void;
  clearOrders: () => void;
}

export const useOrders = create<OrderState>((set) => ({
  orders: [],
  setOrders: (data) => set({ orders: data }),
  clearOrders: () => set({ orders: [] })
}));

interface PermissionsStore {
  permissions: Permissions;
    hydrated: boolean;
  setHydrated: () => void;
  setPermissions: (perms: Permissions) => void;
  clearPermissions: () => void;
}



// export const usePermissions = create<PermissionsStore>()(
//   persist(
//     (set) => ({
//       permissions: defaultPermissions,
//       setPermissions: (perms) => set({ permissions: perms }),
//       clearPermissions: () =>
//         set({ permissions: defaultPermissions }),
//     }),
//     {
//       name: "permissions-storage", // key in localStorage
//     }
//   )
// );
export const usePermissions = create<PermissionsStore>()(
  persist(
    (set) => ({
      permissions: defaultPermissions,
      hydrated: false,

      setPermissions: (perms: Permissions) =>
        set({ permissions: perms }),

      // Fixed: clearPermissions now properly resets state AND removes from storage
      clearPermissions: () =>
        set(() => {
          // Remove from persist storage
          localStorage.removeItem("permissions-storage");
          return { permissions: defaultPermissions, hydrated: true };
        }),

      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "permissions-storage", // key in localStorage
      // Optional: only persist permissions, not hydrated flag
      partialize: (state) => ({ permissions: state.permissions }),

      // Called after rehydration from storage
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);