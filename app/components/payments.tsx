"use client";
import React from "react";

function Payments() {
  const [paymentsmainmodal, setpaymentsmainmodal] = React.useState(true);

  return (
    <>
      {paymentsmainmodal && (
        <div className="fixed inset-0 bg-black/50 z-9999 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <p className="text-black">payments logics will be implemented here</p>
          </div>
          <button type="button" className="bg-amber-400 p-3" onClick={()=>{
            setpaymentsmainmodal(false)
            window.location.reload()
          }}>close</button>
        </div>
      )}
    </>
  );
}

export default Payments;
