// src/pages/DashboardPages/Doctor/DoctorMedicineDetails.jsx

import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getMedicineByIdForDoctor } from "../../../api/doctorMedicinesApi";

export default function DoctorMedicineDetails() {
  const { id } = useParams();

  const { data: m, isLoading } = useQuery({
    queryKey: ["doctor-medicine", id],
    queryFn: () => getMedicineByIdForDoctor(id),
  });

  if (isLoading) return <p className="p-6">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-100">

      {/* IMAGE CONTAINER — prevents stretching/zooming */}
      <div className="w-full bg-gray-50 rounded-xl p-5 flex justify-center items-center mb-6 border">
        <img
          src={m.image ? `http://localhost:5000${m.image}` : "/no-image.png"}
          alt={m.name}
          className="h-60 object-contain"
        />
      </div>

      {/* TITLE */}
      <h2 className="text-3xl font-bold text-gray-800 mb-3">{m.name}</h2>

      {/* TAGS */}
      <div className="flex gap-3 mb-6">
        <span className="px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
          {m.category}
        </span>

        <span className="px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm">
          {m.type}
        </span>
      </div>

      {/* PRICE CARD */}
      <div className="p-4 bg-blue-50 rounded-xl mb-5 text-lg font-semibold text-blue-700 border border-blue-100">
        Price: Rs {m.price}
      </div>

      {/* STOCK */}
      <p className="text-gray-700 mb-6">
        <strong>Stock Available:</strong> {m.stockQuantity}
      </p>

      {/* DETAILS SECTION */}
      <div className="space-y-4 text-gray-800">
        <div>
          <strong className="text-gray-900">Dosage:</strong>
          <p className="mt-1">{m.dosage || "N/A"}</p>
        </div>

        <div>
          <strong className="text-gray-900">Benefits:</strong>
          <p className="mt-1">{m.benefits || "N/A"}</p>
        </div>

        <div>
          <strong className="text-gray-900">Description:</strong>
          <p className="mt-1 leading-relaxed">{m.description || "N/A"}</p>
        </div>

        <div>
          <strong className="text-gray-900">Expiry Date:</strong>
          <p className="mt-1">
            {m.expiryDate
              ? new Date(m.expiryDate).toLocaleDateString()
              : "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
}
