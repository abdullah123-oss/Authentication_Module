// AdminMedicines.jsx
import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllMedicinesApi, deleteMedicineApi } from "../../../api/medicineApi";

export default function AdminMedicines() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["medicines"],
    queryFn: getAllMedicinesApi,
  });

  const medicines = data?.medicines || [];

  const deleteMutation = useMutation({
    mutationFn: deleteMedicineApi,
    onSuccess: () => {
      toast.success("Medicine deleted");
      queryClient.invalidateQueries(["medicines"]);
    },
    onError: () => toast.error("Failed to delete"),
  });

  const handleDelete = (id) => {
    if (window.confirm("Are you sure? This cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredMedicines = useMemo(() => {
    return medicines
      .filter((m) =>
        m.name.toLowerCase().includes(search.toLowerCase())
      )
      .filter((m) => (filterCategory === "all" ? true : m.category === filterCategory));
  }, [medicines, search, filterCategory]);

  return (
    <div>

      {/* Header */}
      <div className="flex justify-between mb-6 items-center">
        <h2 className="text-2xl font-semibold">Manage Medicines</h2>

        <Link
          to="/admin-dashboard/medicines/add"
          className="px-5 py-2 bg-indigo-600 text-white rounded-xl shadow hover:bg-indigo-700 transition"
        >
          + Add Medicine
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-xl p-4 flex flex-wrap gap-4 mb-6">

        <input
          type="text"
          placeholder="Search medicines..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-4 py-2 rounded-lg w-full md:w-1/3"
        />

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="border px-4 py-2 rounded-lg w-full md:w-1/4"
        >
          <option value="all">All Categories</option>
          {[
            "Tablet",
            "Capsule",
            "Syrup",
            "Injection",
            "Drops",
            "Ointment",
            "Inhaler",
            "Powder / Sachet",
            "Supplement / Vitamin",
          ].map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <p className="text-center py-10 text-gray-500">Loading medicines...</p>
      ) : filteredMedicines.length === 0 ? (
        <div className="bg-white p-10 text-center rounded-xl shadow">
          <p className="text-gray-500 text-lg">No medicines found.</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b">
              <tr>
                <th className="p-3">Image</th>
                <th className="p-3">Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Type</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredMedicines.map((m) => (
                <tr key={m._id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <img
                      src={m.image ? `http://localhost:5000${m.image}` : "/no-image.png"}
                      className="h-14 w-14 object-cover rounded border"
                    />
                  </td>

                  <td className="p-3 font-medium">{m.name}</td>
                  <td className="p-3">{m.category}</td>
                  <td className="p-3">{m.type}</td>
                  <td className="p-3">Rs {m.price}</td>
                  <td className="p-3">{m.stockQuantity}</td>

                  <td className="p-3 flex gap-2">
                    <Link
                      to={`/admin-dashboard/medicines/edit/${m._id}`}
                      className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(m._id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
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
