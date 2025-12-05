//AdminOrderDetails.jsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  adminGetOrderByIdApi,
  adminUpdateOrderStatusApi,
} from "../../../api/adminOrdersApi";
import { downloadOrderInvoiceApi } from "../../../api/invoiceApi";
import toast from "react-hot-toast";

export default function AdminOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Load Order
  const { data: order, isLoading } = useQuery({
    queryKey: ["admin-orders", id],
    queryFn: () => adminGetOrderByIdApi(id),
  });

  // Update Status Mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => adminUpdateOrderStatusApi(id, status),
    onSuccess: () => {
      toast.success("Order status updated");
      queryClient.invalidateQueries(["admin-orders"]);
    },
    onError: () => toast.error("Failed to update"),
  });

  const handleDownloadInvoice = async () => {
    if (order.paymentStatus !== "paid") {
      toast.error("Invoice available only for paid orders");
      return;
    }

    try {
      await downloadOrderInvoiceApi(order._id, order.invoiceNumber || order._id);
      toast.success("Invoice downloaded");
    } catch {
      toast.error("Download failed!");
    }
  };

  if (isLoading) return <p className="text-center p-6">Loading order...</p>;
  if (!order) return <p className="text-center p-6 text-red-500">Order not found</p>;

  const nextStatusOptions = ["pending", "processing", "shipped", "delivered"];

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg p-8 rounded-2xl border">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Order Details</h2>

        {order.paymentStatus === "paid" && (
          <button
            onClick={handleDownloadInvoice}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Download Invoice
          </button>
        )}
      </div>

     {/* Order Info */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
  <div className="bg-gray-50 p-4 rounded-xl border">
    <h3 className="font-semibold text-lg mb-2 text-gray-700">Order Info</h3>
    <p><strong>Order ID:</strong> {order._id}</p>
    <p><strong>Total Amount:</strong> Rs {order.totalAmount}</p>
    <p>
      <strong>Payment:</strong>
      <span
        className={`ml-1 px-2 py-1 rounded text-xs ${
          order.paymentStatus === "paid"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {order.paymentStatus}
      </span>
    </p>
  </div>

  <div className="bg-gray-50 p-4 rounded-xl border">
    <h3 className="font-semibold text-lg mb-2 text-gray-700">Customer</h3>
    <p><strong>Name:</strong> {order.userId?.name || "N/A"}</p>
    <p><strong>Email:</strong> {order.userId?.email || "N/A"}</p>
  </div>
</div>


      {/* Items List */}
      <h3 className="text-lg font-semibold mb-3">Items</h3>
      <div className="space-y-4">
        {order.items.map((item) => (
          <div
            key={item.medicineId}
            className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border"
          >
            <img
              src={item.image ? `http://localhost:5000${item.image}` : "/no-image.png"}
              alt=""
              className="w-16 h-16 rounded bg-white border object-contain"
            />
            <div className="flex-1">
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
            </div>
            <p className="font-semibold">Rs {item.price * item.quantity}</p>
          </div>
        ))}
      </div>

      {/* Order Status */}
      <div className="mt-8 bg-gray-50 p-5 rounded-xl border">
        <h3 className="font-semibold text-lg mb-3 text-gray-700">Order Status</h3>

        <div className="flex items-center gap-4">
          <select
            value={order.orderStatus}
            onChange={(e) =>
              statusMutation.mutate({ id, status: e.target.value })
            }
            className="px-4 py-2 border rounded-lg"
          >
            {nextStatusOptions.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>

          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              order.orderStatus === "delivered"
                ? "bg-green-100 text-green-700"
                : order.orderStatus === "shipped"
                ? "bg-blue-100 text-blue-700"
                : order.orderStatus === "processing"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {order.orderStatus}
          </span>
        </div>
      </div>
    </div>
  );
}
