import { create } from "zustand";
import { persist } from "zustand/middleware";

import { MenuItemsTypes,Permissions, ServerInfo} from "@/app/components/types"
interface LoginSession {
  token: string | null;
  setToken: (token: string) => void;
  setUsers: (data: ServerInfo[]) => void; // store as array
  users: ServerInfo[]; // array type
  clearToken: () => void;
  clearUsers: () => void;
}

export const useLoginSession = create<LoginSession>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => set({ token }),
      setUsers: (data) => set({ users: data }),
      users: [],
      clearToken: () => set({ token: null }),
      clearUsers: () => set({ users: [] }),
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
  setPermissions: (perms: Permissions) => void;
  clearPermissions: () => void;
}

const defaultPermissions: Permissions = {
  salesRegister: false,
  orderDisplay: false,
  reports: false,
  wineDisplay:false
};

export const usePermissions = create<PermissionsStore>()(
  persist(
    (set) => ({
      permissions: defaultPermissions,
      setPermissions: (perms) => set({ permissions: perms }),
      clearPermissions: () =>
        set({ permissions: defaultPermissions }),
    }),
    {
      name: "permissions-storage", // key in localStorage
    }
  )
);