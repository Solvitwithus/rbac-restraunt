import { LoginResponse } from "../stores/useAuth";

export interface TableInfo {
  table_id: string;
  table_number: string;
  table_name: string;
  capacity: string;
  occupied_slots: string;
  available_slots: string;
  status: string;
}

export interface MenuItemsTypes {
  stock_id: string;
  name: string;
  description: string;
  price: number;
  units: string;
  category_id: string;
  category_name: string;
}

export interface RestureItemsTypes {
  id?: string;
  orderName: string;
  createdAt: string;
  items: {
    stock_id: string;
    name: string;
    description: string;
    price: number;
    units: string;
    category_id: string;
    category_name: string;
  }[];
}
export interface LoginSessionState {
  token: string | null;
  user: {
    id: string;
    username: string;
    name: string;
    role: string;
    store: string;
  } | null;

  setSession: (data: LoginResponse) => void;
  clearSession: () => void;
}


export interface ServerInfo {
  status: string;  
  id: string;
  token: string;  
   name: string;
  user: {
    id: string;
    username: string;
    name: string;
    role: string;
    store: string;
  };
  timestamp: string;
}


// @/app/components/types.ts
export interface Permission {
  name: string;
  value: boolean;
}
export interface Staff {
  id: string;          
  user_id: string;     
  real_name: string;   
  role_name: string;   
  staff:[]
}
export interface Role {
  id: string;
  name: string;
  cp: string;
  createdAt: string;
  updatedAt: string;
  permissions: Permission[];
}

export interface Permissions {
  salesRegister: boolean;
  orderDisplay: boolean;
  reports: boolean;
  wineDisplay:boolean;
kitchenDisplay:boolean;
 menuList:boolean;
  [key: string]: boolean | undefined;
}
export interface StaffMember {
  id: string;
  user_id: string;
  real_name: string;
  email: string;
  role_name: string;
}

export interface StaffResponse {
  total_staff: number;
  staff: StaffMember[];
}


export const defaultPermissions: Permissions = {
  salesRegister: false,
  orderDisplay: false,
  reports: false,
  wineDisplay: false,
  placeOrder: false,
  holdOrder: false,
   LoadHeldOrders: false,
  payments: false,
   trackOrder:false,
   takeOrder:false,
  viewMenu:false,
  kitchenDisplay:false,
  menuList:false,
};

export interface Render{
    placeOrder: boolean;
  holdOrder: boolean;
   LoadHeldOrders: boolean;
  payments: boolean;
  trackOrder:boolean;
  takeOrder:boolean;
   viewMenu:boolean;
}