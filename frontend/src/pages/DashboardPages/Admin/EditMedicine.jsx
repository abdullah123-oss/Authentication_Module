// EditMedicine.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMedicineByIdApi, updateMedicineApi } from "../../../api/medicineApi";
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

export default function EditMedicine() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["medicine", id],
    queryFn: () => getMedicineByIdApi(id),
  });

  useEffect(() => {
    if (data?.medicine) {
      const m = data.medicine;
      setForm({
        name: m.name,
        category: m.category,
        type: m.type,
        price: m.price,
        stock: m.stockQuantity,
        dosage: m.dosage,
        benefits: m.benefits,
        description: m.description,
        expiryDate: m.expiryDate?.substring(0, 10),
      });
      setPreview(m.image ? `http://localhost:5000${m.image}` : null);
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: updateMedicineApi,
    onSuccess: () => {
      toast.success("Medicine updated");
      queryClient.invalidateQueries(["medicines"]);
      navigate("/admin-dashboard/medicines");
    },
    onError: () => toast.error("Update failed"),
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

    updateMutation.mutate({ id, data: fd });
  };

  if (isLoading) {
    return <p className="text-center py-10 text-gray-500">Loading...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-xl p-8 rounded-2xl border">
      <h2 className="text-3xl font-semibold mb-6">Edit Medicine</h2>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Image Upload */}
        <div>
          <label className="block font-medium mb-2">Medicine Image</label>

          <div className="flex items-center gap-4">
            {preview && (
              <img
                src={preview}
                className="h-28 w-28 object-cover rounded-lg border shadow"
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

          <Input label="Name" name="name" value={form.name} onChange={handleChange} />

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

          <Input label="Price" type="number" name="price" value={form.price} onChange={handleChange} />

          <Input label="Stock" type="number" name="stock" value={form.stock} onChange={handleChange} />

          <Input
            label="Expiry Date"
            type="date"
            name="expiryDate"
            value={form.expiryDate}
            onChange={handleChange}
          />
        </div>

        {/* Full Fields */}
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
          disabled={updateMutation.isPending}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition shadow"
        >
          {updateMutation.isPending ? "Updating..." : "Update Medicine"}
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
