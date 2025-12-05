// src/pages/DashboardPages/Admin/AdminOrders.jsx
import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  adminGetAllOrdersApi,
  adminDeleteOrderApi,
} from "../../../api/adminOrdersApi";
import toast from "react-hot-toast";

export default function AdminOrders() {
  const queryClient = useQueryClient();

  // Filters & search
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Load All Orders
  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => adminGetAllOrdersApi(),
  });

  // Normalize data: support both { orders: [...] } and [...]
  const orders = data?.orders ?? data ?? [];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => adminDeleteOrderApi(id),
    onSuccess: () => {
      toast.success("Order deleted");
      queryClient.invalidateQueries(["admin-orders"]);
    },
    onError: () => toast.error("Delete failed"),
  });

  const handleDelete = (id) => {
    if (!window.confirm("Delete this order? This cannot be undone.")) return;
    deleteMutation.mutate(id);
  };

  // Apply Search + Filter logic
  const filtered = useMemo(() => {
    return orders
      .filter((o) => {
        if (!search) return true;
        const q = search.toLowerCase();
        const userName = o.userId?.name ?? "";
        const userEmail = o.userId?.email ?? "";
        const invoice = o.invoiceNumber ?? "";
        const orderId = o._id ?? "";
        return (
          userName.toLowerCase().includes(q) ||
          userEmail.toLowerCase().includes(q) ||
          invoice.toLowerCase().includes(q) ||
          orderId.toLowerCase().includes(q)
        );
      })
      .filter((o) => (paymentFilter === "all" ? true : o.paymentStatus === paymentFilter))
      .filter((o) => (statusFilter === "all" ? true : o.orderStatus === statusFilter));
  }, [orders, search, paymentFilter, statusFilter]);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Manage Orders</h2>

      {/* FILTER BAR */}
      <div className="bg-white shadow p-4 rounded-xl mb-6 flex flex-wrap gap-4">

        {/* Search */}
        <input
          type="text"
          placeholder="Search by user or order ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border rounded-lg w-full md:w-1/3"
        />

        {/* Payment Status Filter */}
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Payments</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
        </select>

        {/* Order Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
        </select>

      </div>

      {/* TABLE */}
      {isLoading ? (
        <p className="text-center text-gray-500 py-10">Loading orders...</p>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-10 text-center rounded-xl shadow">
          <p className="text-gray-500 text-lg">No orders found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b">
              <tr>
                <th className="p-3">Order / Invoice</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Items</th>
                <th className="p-3">Total Amount</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((o) => (
                <tr key={o._id} className="border-b hover:bg-gray-50">

                  <td className="p-3 text-xs">
                    <div className="flex flex-col">
                      {/* Primary visible code: business-friendly invoice or short id */}
                      <span className="font-mono" title={o._id}>
                        {o.invoiceNumber || (o._id ? o._id.slice(-8) : "")}
                      </span>
                      {/* Optional hint: show that tooltip has full ID */}
                      {o._id && (
                        <span className="text-[10px] text-gray-400">
                          Hover to see full ID
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="p-3">
                    <div className="font-medium">{o.userId?.name ?? "—"}</div>
                    <div className="text-xs text-gray-500">{o.userId?.email ?? "—"}</div>
                  </td>

                  <td className="p-3">{o.items?.length ?? 0} items</td>
                  <td className="p-3 font-semibold text-indigo-700">
                    Rs {o.totalAmount}
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        o.paymentStatus === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {o.paymentStatus}
                    </span>
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        o.orderStatus === "delivered"
                          ? "bg-green-100 text-green-700"
                          : o.orderStatus === "shipped"
                          ? "bg-blue-100 text-blue-700"
                          : o.orderStatus === "processing"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {o.orderStatus}
                    </span>
                  </td>

                  <td className="p-3 text-center flex gap-3 justify-center">

                    {/* VIEW DETAILS */}
                    <Link
                      to={`/admin-dashboard/orders/${o._id}`}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      View
                    </Link>

                    {/* DELETE */}
                    <button
                      onClick={() => handleDelete(o._id)}
                      className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Delete
                    </button>

                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}
    </div>
  );
}                             