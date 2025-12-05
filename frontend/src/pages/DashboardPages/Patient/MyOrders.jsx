// src/pages/DashboardPages/Patient/MyOrders.jsx
import React from "react";
import fileDownload from "js-file-download";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { getMyOrdersApi } from "../../../api/orderApi";
import { downloadOrderInvoiceApi } from "../../../api/invoiceApi";

export default function MyOrders() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: getMyOrdersApi,
  });

  const orders = data?.orders || data || [];

  // 🔽 Download Invoice function
  const handleDownloadInvoice = async (orderId, invoiceNumber) => {
  try {
    await downloadOrderInvoiceApi(orderId, invoiceNumber);
    toast.success("Invoice downloaded");
  } catch {
    toast.error("Download failed!");
  }
};


  if (isLoading) {
    return <p className="p-6 text-center text-gray-600">Loading your orders...</p>;
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white p-10 rounded-2xl shadow text-center text-gray-600">
        <p>You have not placed any orders yet.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">My Orders</h2>

      <div className="space-y-5">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white rounded-2xl shadow border border-gray-100 p-5"
          >
            {/* Top row */}
            <div className="flex flex-wrap justify-between gap-3 border-b pb-3 mb-3">
              <div>
                <p className="text-sm text-gray-500">
                  Order ID: <span className="font-mono">{order._id.slice(-8)}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Placed on: {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="flex flex-col items-end gap-1 text-sm">
                {/* Payment Status */}
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    order.paymentStatus === "paid"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {order.paymentStatus === "paid" ? "Payment: Paid" : "Payment: Unpaid"}
                </span>

                {/* Order Status */}
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 capitalize">
                  Status: {order.orderStatus}
                </span>

                <p className="text-base font-bold text-blue-700 mt-1">
                  Total: Rs {order.totalAmount}
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-3">
              {order.items?.map((item) => (
                <div
                  key={item.medicineId}
                  className="flex items-center gap-4 border-b last:border-b-0 pb-3 last:pb-0"
                >
                  {/* Image */}
                  <div className="w-16 h-16 bg-gray-50 rounded-lg border flex items-center justify-center overflow-hidden">
                    <img
                      src={item.image ? `http://localhost:5000${item.image}` : "/no-image.png"}
                      alt={item.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      Qty: {item.quantity} × Rs {item.price}
                    </p>
                  </div>

                  {/* Line Total */}
                  <div className="text-sm font-semibold text-gray-800">
                    Rs {item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>

            {/* 🔽 Invoice Button (Show only if Paid) */}
            {order.paymentStatus === "paid" && (
              <div className="pt-4 flex justify-end">
                <button
  onClick={() => handleDownloadInvoice(order._id, order.invoiceNumber)}
  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
>
  Download Invoice
</button>

              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
