// src/pages/DashboardPages/Patient/CartPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCartApi,
  updateCartApi,
  removeFromCartApi,
  clearCartApi,
} from "../../../api/cartApi";

import toast from "react-hot-toast";

export default function CartPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: getCartApi,
  });

  const cart = data || { items: [], totalAmount: 0 };

  const updateMutation = useMutation({
    mutationFn: ({ id, qty }) => updateCartApi(id, qty),
    onSuccess: () => {
      queryClient.invalidateQueries(["cart"]);
      toast.success("Quantity updated");
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id) => removeFromCartApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["cart"]);
      toast.success("Item removed");
    },
  });

  const clearMutation = useMutation({
    mutationFn: clearCartApi,
    onSuccess: () => {
      queryClient.invalidateQueries(["cart"]);
      toast.success("Cart cleared");
    },
  });

  if (isLoading) return <p className="p-6">Loading Cart...</p>;

  if (cart.items.length === 0)
    return (
      <div className="bg-white p-10 rounded-xl shadow text-center text-gray-600">
        <p>Your cart is empty.</p>
      </div>
    );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">

      {/* LEFT — ITEMS */}
      <div className="lg:col-span-2 space-y-5">
        {cart.items.map((item) => (
          <div
            key={item.medicineId}
            className="flex gap-4 bg-white p-4 rounded-xl shadow border"
          >
            {/* IMAGE */}
            <img
              src={
                item.image
                  ? `http://localhost:5000${item.image}`
                  : "/no-image.png"
              }
              className="h-24 w-24 rounded-lg object-contain border"
            />

            {/* INFO */}
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{item.name}</h3>
              <p className="text-gray-500 text-sm">Rs {item.price}</p>

              {/* Quantity Stepper */}
              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={() =>
                    updateMutation.mutate({
                      id: item.medicineId,
                      qty: Math.max(1, item.quantity - 1),
                    })
                  }
                  className="px-3 py-1 bg-gray-200 rounded"
                >
                  -
                </button>

                <span className="font-semibold">{item.quantity}</span>

                <button
                  onClick={() =>
                    updateMutation.mutate({
                      id: item.medicineId,
                      qty: item.quantity + 1,
                    })
                  }
                  className="px-3 py-1 bg-gray-200 rounded"
                >
                  +
                </button>
              </div>
            </div>

            {/* REMOVE */}
            <button
              onClick={() => removeMutation.mutate(item.medicineId)}
              className="text-red-500 font-medium hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* RIGHT — SUMMARY */}
      <div className="bg-white p-6 rounded-xl shadow border sticky top-20 h-fit">
        <h3 className="text-xl font-bold mb-4">Order Summary</h3>

        <div className="flex justify-between text-lg font-semibold">
          <span>Total:</span>
          <span>Rs {cart.totalAmount}</span>
        </div>

        <button
          onClick={() => clearMutation.mutate()}
          className="mt-5 w-full py-3 bg-gray-300 hover:bg-gray-400 rounded-lg"
        >
          Clear Cart
        </button>

        {/* 🚀 UPDATED BUTTON */}
        <button
          onClick={() => {
            if (cart.items.length === 0) {
              toast.error("Your cart is empty");
              return;
            }
            navigate("/patient-dashboard/checkout");
          }}
          className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
        >
          Proceed to Checkout
        </button>
      </div>

    </div>
  );
}
