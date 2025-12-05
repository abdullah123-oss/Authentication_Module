// src/pages/DashboardPages/Patient/PatientMedicines.jsx
import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAllMedicinesPublic } from "../../../api/doctorMedicinesApi";

export default function PatientMedicines() {
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["patient-medicines"],
    queryFn: getAllMedicinesPublic,
  });

  const medicines = data || [];

  const filteredMedicines = useMemo(() => {
    return medicines
      .filter((m) => m.name.toLowerCase().includes(search.toLowerCase()))
      .filter((m) =>
        filterCategory === "all" ? true : m.category === filterCategory
      );
  }, [search, filterCategory, medicines]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Browse Medicines</h2>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow flex flex-wrap gap-4 mb-6 border border-gray-100">
        <input
          type="text"
          placeholder="Search medicines..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-4 py-2 rounded-lg w-full md:w-1/3 bg-gray-50"
        />

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="border px-4 py-2 rounded-lg w-full md:w-1/4 bg-gray-50"
        >
          <option value="all">All Categories</option>
          <option>Tablet</option>
          <option>Capsule</option>
          <option>Syrup</option>
          <option>Injection</option>
          <option>Drops</option>
          <option>Ointment</option>
          <option>Inhaler</option>
          <option>Powder / Sachet</option>
          <option>Supplement / Vitamin</option>
        </select>
      </div>

      {/* Loading */}
      {isLoading && (
        <p className="text-gray-500 text-center">Loading medicines...</p>
      )}

      {/* Empty */}
      {!isLoading && filteredMedicines.length === 0 && (
        <div className="bg-white p-10 rounded-xl shadow text-center">
          <p className="text-gray-500">No medicines found.</p>
        </div>
      )}

      {/* Medicines Grid */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMedicines.map((m) => (
          <Link
            to={`/patient-dashboard/medicines/${m._id}`}
            key={m._id}
            className="bg-white p-4 rounded-2xl shadow-md hover:shadow-xl transition-all border hover:-translate-y-1"
          >
            {/* Image wrapper - same as doctor UI */}
            <div className="bg-gray-50 rounded-xl h-40 w-full flex items-center justify-center overflow-hidden p-3">
              <img
                src={m.image ? `http://localhost:5000${m.image}` : "/no-image.png"}
                alt={m.name}
                className="h-full object-contain"
              />
            </div>

            <h3 className="font-semibold text-lg mt-3 text-gray-800">{m.name}</h3>

            {/* Category badge */}
            <span className="inline-block mt-1 px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs">
              {m.category}
            </span>

            <p className="mt-2 font-bold text-blue-700">Rs {m.price}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
