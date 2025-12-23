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
export interface DiningSessionDTO {
  session_id: string;
  table_id: string;
  session_date: string;          // YYYY-MM-DD
  start_time: string;            // YYYY-MM-DD HH:mm:ss
  end_time: string | null;
  guest_count: string;
  status: "active" | "closed" | "cancelled";
  total_amount: string;          // decimal as string
  notes: string;
  created_by: string;
  session_type: "individual" | "group";
  table_number: string;
  table_name: string;
  capacity: string;
  duration_formatted: string;    // HH:mm
  duration_minutes: number;
}
export interface PaymentTransaction {
  Auto: string;          // e.g. "101481"
  name: string;          // Customer name
  TransID: string;       // Transaction reference
  TransAmount: string;   // Amount paid (string from API)
  TransTime: string;     // Timestamp in YYYYMMDDHHMMSS format
}

export interface PosPaymentResponse {
  id: string;                       // "134"
  ptype: "CASH" | string;           // payment type
  ptotal: string;                   // total paid (string from backend)
  payments: string | null;          // often "null" as string
  pitems: string;                   // JSON string of items
  cp: string;                       // "0_"
  uname: string;                    // username
  uid: string;                      // user ID
  pdate: string;                    // "2025-12-23 14:12:31"
  print: string;                    // "1"
  customername: string;             // "CASH SALES"
  customerid: string;               // "3"
  booking: string;                  // "1"
  dispatch: string;                 // "0"
  salepersonId: string;             // "0"
  salepersonName: string;
  unique_identifier: string;        // timestamp string
  pin: string;
  walk_in_customer_name: string | null;
  salesperson_option: string | null;
  weight_taken: string;             // "0.000"
  order_no: string;
  invNo: string;                    // invoice number
  delNo: string;                    // delivery number
  posSaleInsertId: string;          // "POS#000000134"
  qrCode: string;
  qrDate: string;
  controlCode: string;
  middlewareInvoiceNumber: string;
  weight: number;
}

export interface OrderDTO {
  id: string;
  order_no: string;
  session_id: string;
  booking_id: string | null;
  room_id: string | null;
  table_id: string;
  client_name: string;
  item_code: string;
  quantity: string;           // decimal string
  unit_price: string;         // decimal string
  dept_id: string;
  order_time: string;         // YYYY-MM-DD HH:mm:ss
  status: "ordered" | "served" | "cancelled";
  served_time: string | null;
  notes: string;
  invoice_ref: string | null;
  invoice_date: string | null;
  billing_status: "pending" | "ready" | "billed";
  billing_started: string | null;
  invoice_no: string | null;
  include_in_bill: "0" | "1";
  item_description: string;
  dept_name: string;
  dept_code: string;
  table_number: string;
  wait_minutes: number;
  line_total: number;
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