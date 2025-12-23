

/**
 * =============================================================================
 * DigiSales POS – Backend API Access Layer
 * =============================================================================
 *
 * @file app/hooks/access.ts (or lib/api/access.ts)
 * @author John Kamiru Mwangi
 *@date Updated: Dec 3 2025
 * @description
 *   Central collection of all API calls used throughout the Next.js POS frontend.
 *   All functions communicate with the legacy PHP backend via multipart/form-data
 *   POST requests to a single endpoint defined in NEXT_PUBLIC_BASEURL.
 *
 *   The backend uses two hidden control parameters:
 *     • tp = transaction/process type (determines which script runs)
 *     • cp = control prefix (currently always "0_") you can also think of this as company prefix
 *
 *   This file acts as a clean abstraction layer – components and hooks should
 *   import from here rather than calling axios directly.
 *
 * @environment
 *   NEXT_PUBLIC_BASEURL → Full URL of the backend gateway (e.g. https://yourdomain.com/api/gateway.php)
 *
 * @securityNote
 *   Authentication is session-based. After successful Login(), the backend sets
 *   HTTP-only cookies that are automatically sent with subsequent requests.
 *
 * @exportedFunctions
 *
 *   Login()                    → Authenticate cashier/user
 *   RestrauntTables()          → Get all tables with status/capacity
 *   getMenu()                  → Fetch complete menu (for search & KDS)
 *   SessionCreation()          → Start new dining session (required before ordering)
 *   CreateOrderItem()          → Add line item to an active session
 *   GetAllActiveSessions()     → List all currently open sessions
 *   GetPerSessionOrders()      → Retrieve orders for a specific session
 *   UpdateItemstatus()         → Kitchen: mark order as preparing → ready → served
 *
 * @responseFormat (general)
 *   Most endpoints return:
 *   {
 *     status: "SUCCESS" | "ERROR" | number,
 *     message?: string,
 *     data?: any
 *   }
 *   Some older endpoints return raw arrays or status 200 without wrapper.
 *
 * @errorHandling
 *   • Axios errors are caught and logged
 *   • Functions return null or a fallback object on failure
 *   • Consumer components should check return value and show toast/alert
 *
 * @futureImprovements / Roadmap
 *   • Convert to typed fetch() + Zod validation for runtime safety
 *   • Add request cancellation (AbortController)
 *   • Implement retry logic with exponential backoff
 *   • Add TanStack Query / React Query hooks wrappers
 *   • Generate OpenAPI spec from these functions
 *   • Add request/response interceptors (auth refresh, logging)
 *   • Unit + integration tests with MSW
 *
 * @maintenanceTips
 *   • Always keep "tp" and "cp" values in sync with backend expectations
 *   • When backend adds new fields, update corresponding function here first
 *   • Never expose raw axios instances in components – keep logic encapsulated
 *
 * =============================================================================
 */

import axios from "axios";
import { StaffResponse } from "../components/types";





export async function Login(
  username: string,
  password: string
): Promise<unknown> {
  try {
    const formData = new FormData();
    formData.append("tp", "pos_login");
    formData.append("cp", "0_");
    formData.append("username", username);
    formData.append("password", password);

    const response = await axios.postForm(
      process.env.NEXT_PUBLIC_BASEURL as string,
      formData
    );

    return response.data;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}


export async function StaffMembers(): Promise<StaffResponse | null> {
  try {
    const formData = new FormData();
    formData.append("tp", "get_staff");
    formData.append("cp", "0_");

    const response = await axios.postForm(
      process.env.NEXT_PUBLIC_BASEURL as string,
      formData
    );

    return response.data as StaffResponse;
  } catch (error) {
    console.error("Error fetching staff:", error);
    return null;
  }
}


export async function RestrauntTables(){
  try{
  const formData = new FormData();
  formData.append("tp","get_tables");
  formData.append("cp", "0_");

    const response = await axios.postForm(
      process.env.NEXT_PUBLIC_BASEURL as string,
      formData
    );

    return response.data;
  }
  catch (error) {
    console.error("Error:", error);
    return null;
  }
}



export async function SessionCreation(
  table_id: string,
  guest_count: number | string,
  session_type?: string,
  notes?: string
) {
  try {
    const formData = new FormData();
    formData.append("tp", "create_session");
    formData.append("cp", "0_");
    formData.append("table_id", table_id);
    formData.append("guest_count", guest_count.toString());

    if (session_type) formData.append("session_type", session_type);
    if (notes) formData.append("notes", notes);

    const response = await axios.postForm(
      process.env.NEXT_PUBLIC_BASEURL as string,
      formData
    );

    console.log("Session creation response:", response.data); // ✅ debug
    return response.data; 
  } catch (error: unknown) {
  if (axios.isAxiosError(error)) {
    console.error("useSessionCreation error:", error.response || error);

    return { 
      status: "ERROR", 
      message: error.response?.data?.message || error.message || "Request failed" 
    };
  }

  // Non-Axios error
  console.error("useSessionCreation error:", error);

  return { 
    status: "ERROR", 
    message: error instanceof Error ? error.message : "Request failed" 
  };
}

}


export async function getMenu(){
    try{
  const formData = new FormData();
  formData.append("tp","get_menu");
  formData.append("cp", "0_");

    const response = await axios.postForm(
      process.env.NEXT_PUBLIC_BASEURL as string,
      formData
    );

    return response.data;
  }
  catch (error) {
    console.error("Error:", error);
    return null;
  }
}


export async function CreateOrderItem({
  session_id,
  item_code,
  quantity,
  client_name,
  notes,
}: {
  session_id: string;
  item_code: string;
  quantity: number;
  client_name?: string;
  notes?: string;
}) {

  console.log("Hi i am touched");

  try {
    const formData = new FormData();
    formData.append("tp", "create_order"); // REQUIRED
    formData.append("session_id", session_id);
    formData.append("item_code", item_code);
    formData.append("quantity", quantity.toString());
    formData.append("client_name", client_name || "");
    formData.append("notes", notes || "");
    formData.append("cp", "0_"); // REQUIRED by backend

    console.log("FORMDATA OUT:", [...formData.entries()]); // test

    const response = await axios.postForm(
      process.env.NEXT_PUBLIC_BASEURL as string,
      formData
    );

    console.log("API RESPONSE:", response.data);

    return response.data;
  } catch (error) {
    console.error("CreateOrderItem Error:", error);
    return null;
  }
}



export async function GetAllActiveSessions()
{
   try{
  const formData = new FormData();
  formData.append("tp","get_sessions");
  formData.append("cp", "0_");

    const response = await axios.postForm(
      process.env.NEXT_PUBLIC_BASEURL as string,
      formData
    );

    return response.data;
  }
  catch (error) {
    console.error("Error:", error);
    return null;
  }
}


export async function GetPerSessionOrders(
  {
    session_id
  }:{
   session_id:string; 
  }
){
 try{
  const formData = new FormData();
  formData.append("tp","get_session_orders");
  formData.append("cp", "0_");
  formData.append("session_id", session_id);

    const response = await axios.postForm(
      process.env.NEXT_PUBLIC_BASEURL as string,
      formData
    );

    return response.data;
  }
  catch (error) {
    console.error("Error:", error);
    return null;
  }
}

interface UpdateStatusResponse {
  status: "SUCCESS" | "ERROR";
  message?: string;
  // add more if your backend returns them
}

export async function UpdateItemstatus({
  order_id,
  status,
}: {
  order_id: string;
  status: "preparing" | "ready" | "served"; // optional: restrict allowed values
}): Promise<UpdateStatusResponse | null> {
  const formData = new FormData();

  // These seem to be required by your backend
  formData.append("tp", "update_order_status"); // Better name than "get_session_orders"!
  formData.append("cp", "0_");
  formData.append("order_id", order_id);
  formData.append("status", status);

  try {
    const response = await axios.postForm(
      process.env.NEXT_PUBLIC_BASEURL!, // non-null assertion if you're sure it's set
      formData,
      // axios automatically sets Content-Type: multipart/form-data
    );

    return response.data as UpdateStatusResponse;
  } catch (error: any) {
    console.error("Failed to update order status:", error?.message || error);

    // Optional: show toast in hook? Better to do it in component
    // toast.error("Failed to update status");

    return null;
  }
}





//   export async function postCashPayment({
//   total,
//   items, // Array of items (from posdesc structure)
//   ordersToClear, // Array of orders to clear after payment
//   customerName = "",
//   customerPin = "",
//   mpesaRefCode,
  
// }: {
//   total: number;
//   items: Array<{
//     quantity: string;
//     item_option: string;
//     item_option_id: string;
//     price: string;
//     total: number;
//     tax?: string;
//     discount?: string;
//     // Add other fields if needed later
//   }>;
//   ordersToClear: Array<{
//     order_no?: string;
//     trans_type?: string;
//     reference?: string;
//     walk_in_customer_name?: string;
//   }>;
//   customerName?: string;
//   customerPin?: string;
//   mpesaRefCode?:string;
  
// }) {
//   try {
//     const formData = new FormData();

//     // Required fixed fields
//     formData.append("tp", "booking-cash-payment");
//     formData.append("cp", "0_");
//     formData.append("id", "104"); // Seems constant in your examples
//     formData.append("ttp", "CASH");
//     formData.append("total", total.toString());

//     // Payment record
//     const paymentRecord = {
//       name: "CASH",
//       TransID: Date.now() || mpesaRefCode, // Unique timestamp-based ID
//       TransAmount: total,
//       Auto: Date.now(),
//       TransTime: Date.now(),
//       MSISDN: "",
//       Transtype: "CASH",
//       Cheque: "",
//       p: "0",
//     };
//     formData.append("pospayments", JSON.stringify([paymentRecord]));

//     // Items description (posdesc)
//     const posdescItems = items.map((item) => ({
//       quantity: item.quantity,
//       quantityAval: "1", // You can adjust logic if needed
//       booking_id: "",
//       customer_option: "CASH SALES",
//       customer_option_id: "3",
//       booking_type: "",
//       discount: item.discount || "0",
//       mode_prices: "1",
//       kit: "0",
//       batch_no: "",
//       tax: item.tax || "0",
//       item_option: item.item_option,
//       item_option_id: item.item_option_id,
//       rate: "8", // Assuming standard rate
//       deposit: "",
//       total: item.total,
//       price: item.price,
//       posBatchSelect: "",
//       bottles_issued: "",
//       bottles_returned: "",
//       fsalesp: "",
//     }));
//     formData.append("posdesc", JSON.stringify(posdescItems));

//     // Optional fields
//     formData.append("uname", "digisoft_support");
//     formData.append("cpbooking_id", "");
//     formData.append("cust_name", customerName ||"");
//     formData.append("cust_pin", customerPin || "");
//     formData.append("unique_identifier", Date.now().toString());

//     // Orders to clear after payment
//     formData.append("orders_to_clear", JSON.stringify(ordersToClear));

//     const response = await axios.postForm("https://marvel.digerp.com/test/process.php", formData);

//     return response.data;
//   } catch (error: any) {
//     console.error("Error posting cash payment:", error);
//     throw error?.response?.data || { message: "Payment failed" };
//   }

// }

// hooks/access.ts

export async function postCashPayment({
  total,
  items,
  ordersToClear,
  customerName = "",
  customerPin = "",
  cashAmount = 0,
  mpesaTransaction = null, // { name, TransID, TransAmount, TransTime, Auto }
}: {
  total: number;
  items: Array<{
    quantity: string;
    item_option: string;
    item_option_id: string;
    price: string;
    total: number;
  }>;
  ordersToClear: Array<{
    order_no?: string;
    trans_type?: string;
    reference?: string;
    walk_in_customer_name?: string;
  }>;
  customerName?: string;
  customerPin?: string;
  cashAmount?: number;
  mpesaTransaction?: {
    name: string;
    TransID: string;
    TransAmount: string;
    TransTime: string;
    Auto: string;
  } | null;
}) {
  try {
    const formData = new FormData();

    formData.append("tp", "booking-cash-payment");
    formData.append("cp", "0_");
    formData.append("id", "104");
    formData.append("ttp", "CASH");
    formData.append("total", total.toString());

    const now = Date.now().toString();

    const pospayments: any[] = [];

    // Always add CASH entry
    pospayments.push({
      name: "CASH",
      TransID: now,
      TransAmount: cashAmount,
      Auto: now,
      TransTime: now,
      MSISDN: "",
      Transtype: "CASH",
      Cheque: "",
      p: "0",
    });

    // Add M-Pesa if provided
    if (mpesaTransaction) {
      pospayments.push({
        name: mpesaTransaction.name,
        TransID: mpesaTransaction.TransID,
        TransAmount: mpesaTransaction.TransAmount,
        TransTime: mpesaTransaction.TransTime,
        Transtype: "MPESA",
        Auto: mpesaTransaction.TransID,
        MSISDN: "",
        Cheque: "",
        p: "",
      });
    }

    formData.append("pospayments", JSON.stringify(pospayments));

    // posdesc items
    const posdescItems = items.map((item) => ({
      quantity: item.quantity,
      quantityAval: "1",
      booking_id: "",
      customer_option: "CASH SALES",
      customer_option_id: "3",
      booking_type: "",
      discount: "0",
      mode_prices: "1",
      kit: "0",
      batch_no: "",
      tax: "0",
      item_option: item.item_option,
      item_option_id: item.item_option_id,
      rate: "8",
      deposit: "",
      total: item.total,
      price: item.price,
      posBatchSelect: "",
      bottles_issued: "",
      bottles_returned: "",
      fsalesp: "",
    }));

    formData.append("posdesc", JSON.stringify(posdescItems));

    formData.append("uname", "digisoft_suppor");
    formData.append("cpbooking_id", "");
    formData.append("cust_name", customerName);
    formData.append("cust_pin", customerPin);
    formData.append("unique_identifier", now);

    formData.append("orders_to_clear", JSON.stringify(ordersToClear));

    const response = await axios.postForm("https://marvel.digerp.com/test/process.php", formData);

    return response.data;
  } catch (error: any) {
    console.error("Payment error:", error);
    throw error?.response?.data || { message: "Payment failed" };
  }
}


export async function GetProcessedTransactions(){
  try{
    const today = new Date().toISOString().split("T")[0];
 const formData = new FormData();

    // Required fixed fields
    formData.append("tp", "loadPOSTransaction");
    formData.append("cp", "0_");
    formData.append("id", "104");
    formData.append("postrans_date", today);
    formData.append("end_date", today);

    const response = await axios.postForm("https://marvel.digerp.com/test/process.php", formData);

    return response.data;
  }
  catch(e:unknown){
    console.log(e);
    
  }


 
}

 export async function LoadMpesaTransactions(){
      try{
   
 const formData = new FormData();
    formData.append("tp", "loadMpesaTransaction");
    formData.append("cp", "0_");
    formData.append("id", "2");
  

    const response = await axios.postForm("https://marvel.digerp.com/test/process.php", formData);

    return response.data;
  }
  catch(e:unknown){
    console.log(e);
    
  }
  }