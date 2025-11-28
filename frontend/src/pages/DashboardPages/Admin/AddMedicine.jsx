// AddMedicine.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMedicineApi } from "../../../api/medicineApi";
import toast from "react-hot-toast";

const categories = [
  "Tablet",
  "Capsule",
  "Syrup",
  "Injection",
  "Drops",
  "Ointment",
  "Inhaler",
  "Powder / Sachet",
  "Supplement / Vitamin",
];

export default function AddMedicine() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    name: "",
    category: "Tablet",
    type: "OTC",
    price: "",
    stock: "",
    dosage: "",
    benefits: "",
    description: "",
    expiryDate: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const createMutation = useMutation({
    mutationFn: createMedicineApi,
    onSuccess: () => {
      toast.success("Medicine added!");
      queryClient.invalidateQueries(["medicines"]);
      navigate("/admin-dashboard/medicines");
    },
    onError: () => toast.error("Failed to add medicine"),
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (imageFile) fd.append("image", imageFile);

    createMutation.mutate(fd);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-xl p-8 rounded-2xl border">
      <h2 className="text-3xl font-semibold mb-6">Add Medicine</h2>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Image Upload */}
        <div>
          <label className="block mb-2 font-medium">Medicine Image</label>

          <div className="flex items-center gap-4">
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="h-28 w-28 rounded-lg object-cover border shadow"
              />
            )}

            <label className="cursor-pointer bg-gray-100 px-4 py-2 rounded-lg border hover:bg-gray-200 transition">
              Choose Image
              <input type="file" className="hidden" accept="image/*" onChange={handleImage} />
            </label>
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid md:grid-cols-2 gap-6">

          <Input label="Name" name="name" value={form.name} onChange={handleChange} required />

          <Select
            label="Category"
            name="category"
            value={form.category}
            onChange={handleChange}
            options={categories}
          />

          <Select
            label="Type"
            name="type"
            value={form.type}
            onChange={handleChange}
            options={["OTC", "Prescription"]}
          />

          <Input
            label="Price"
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            required
          />

          <Input
            label="Stock"
            name="stock"
            type="number"
            value={form.stock}
            onChange={handleChange}
            required
          />

          <Input
            label="Expiry Date"
            name="expiryDate"
            type="date"
            value={form.expiryDate}
            onChange={handleChange}
          />
        </div>

        {/* Full Width Fields */}
        <Input label="Dosage" name="dosage" value={form.dosage} onChange={handleChange} />

        <Input label="Benefits" name="benefits" value={form.benefits} onChange={handleChange} />

        <Textarea
          label="Description"
          name="description"
          rows="4"
          value={form.description}
          onChange={handleChange}
        />

        <button
          type="submit"
          disabled={createMutation.isPending}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition shadow"
        >
          {createMutation.isPending ? "Creating..." : "Create Medicine"}
        </button>
      </form>
    </div>
  );
}

/* ----- Reusable UI Components ----- */

function Input({ label, ...props }) {
  return (
    <div>
      <label className="block font-medium mb-1">{label}</label>
      <input
        {...props}
        className="w-full border rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:ring-indigo-400 outline-none transition"
      />
    </div>
  );
}

function Select({ label, options, ...props }) {
  return (
    <div>
      <label className="block font-medium mb-1">{label}</label>
      <select
        {...props}
        className="w-full border rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:ring-indigo-400 outline-none transition"
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function Textarea({ label, ...props }) {
  return (
    <div>
      <label className="block font-medium mb-1">{label}</label>
      <textarea
        {...props}
        className="w-full border rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:ring-indigo-400 outline-none transition"
      />
    </div>
  );
}
