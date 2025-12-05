// src/pages/DashboardPages/Patient/PatientMedicineDetails.jsx
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { getMedicineByIdPublic } from "../../../api/doctorMedicinesApi";
import { addToCartApi } from "../../../api/cartApi";

import { useCartStore } from "../../../stores/cartStore";
import toast from "react-hot-toast";

export default function PatientMedicineDetails() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const loadCartCount = useCartStore((s) => s.loadCartCount);

  const [qty, setQty] = useState(1);

  const { data: m, isLoading } = useQuery({
    queryKey: ["patient-medicine", id],
    queryFn: () => getMedicineByIdPublic(id),
  });

  const addMutation = useMutation({
    mutationFn: ({ id, qty }) => addToCartApi(id, qty),
    onSuccess: () => {
      toast.success("Added to cart!");
      queryClient.invalidateQueries(["cart"]);
      loadCartCount();
    },
    onError: () => toast.error("Failed to add to cart"),
  });

  if (isLoading) return <p className="p-6">Loading...</p>;
  if (!m) return <p className="p-6">Medicine not found</p>;

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-100">

      <div className="w-full bg-gray-50 rounded-xl p-5 flex justify-center items-center mb-6 border">
        <img
          src={m.image ? `http://localhost:5000${m.image}` : "/no-image.png"}
          alt={m.name}
          className="h-60 object-contain"
        />
      </div>

      <h2 className="text-3xl font-bold text-gray-800 mb-3">{m.name}</h2>

      <div className="flex gap-3 mb-6">
        <span className="px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
          {m.category}
        </span>
        <span className="px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm">
          {m.type}
        </span>
      </div>

      <div className="p-4 bg-blue-50 rounded-xl mb-5 text-lg font-semibold text-blue-700 border border-blue-100">
        Price: Rs {m.price}
      </div>

      <p className="text-gray-700 mb-6">
        <strong>Stock Available:</strong> {m.stockQuantity}
      </p>

      {m.stockQuantity > 0 && (
        <div className="flex items-center gap-4 mb-6">
          <strong>Quantity:</strong>
          <select
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            className="border px-4 py-2 rounded-lg"
          >
            {[...Array(Math.min(m.stockQuantity, 10)).keys()].map((x) => (
              <option key={x + 1} value={x + 1}>
                {x + 1}
              </option>
            ))}
          </select>
        </div>
      )}

      <button
        disabled={m.stockQuantity === 0 || addMutation.isPending}
        onClick={() => addMutation.mutate({ id: m._id, qty })}
        className={`w-full md:w-auto px-6 py-3 rounded-lg text-white font-semibold transition
          ${
            m.stockQuantity > 0
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
      >
        {m.stockQuantity > 0
          ? addMutation.isPending
            ? "Adding..."
            : "Add to Cart"
          : "Out of Stock"}
      </button>

      <hr className="my-8" />

      <div className="space-y-4 text-gray-800">
        <div>
          <strong>Dosage:</strong>
          <p>{m.dosage || "N/A"}</p>
        </div>
        <div>
          <strong>Benefits:</strong>
          <p>{m.benefits || "N/A"}</p>
        </div>
        <div>
          <strong>Description:</strong>
          <p>{m.description || "N/A"}</p>
        </div>
        <div>
          <strong>Expiry Date:</strong>
          <p>{m.expiryDate ? new Date(m.expiryDate).toLocaleDateString() : "N/A"}</p>
        </div>
      </div>
    </div>
  );
}
