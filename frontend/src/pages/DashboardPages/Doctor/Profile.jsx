// src/pages/DashboardPages/Doctor/Profile.jsx
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../../stores/useAuthStore";
import API from "../../../api/axios";
import { getImageUrl } from "../../../utils/imageUrl"; // <-- NEW

// Helper: initials
const getInitials = (name = "") =>
  name
    .trim()
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const DoctorProfile = () => {
  const { user, setUser } = useAuthStore(); 
  const fileInputRef = useRef(null);

  // ------------ Form State ------------
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    experience: "",
    clinicAddress: "",
    consultationFee: "",
    bio: "",
  });

  const [previewPic, setPreviewPic] = useState(null);
  const [pictureFile, setPictureFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // ------------ Load User Data ------------
  useEffect(() => {
    if (!user) return;

    setForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      specialization: user.specialization || "",
      experience: user.experience || "",
      clinicAddress: user.clinicAddress || "",
      consultationFee: user.consultationFee || "",
      bio: user.bio || "",
    });

    // Load existing pic OR empty
    setPreviewPic(user.profilePic ? getImageUrl(user.profilePic) : null);
  }, [user]);

  // ------------ Handlers ------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ------------ Update Profile (Text fields) ------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        specialization: form.specialization,
        experience: form.experience,
        clinicAddress: form.clinicAddress,
        consultationFee: form.consultationFee,
        bio: form.bio,
      };

      const { data } = await API.put("/profile/update", payload);

      toast.success("Profile updated");

      if (data.user) setUser(data.user);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  // ------------ Image Upload ------------
  const openFileDialog = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPictureFile(file);

    // Temporary preview (blob)
    setPreviewPic(URL.createObjectURL(file));
  };

  const handleUploadPicture = async () => {
    if (!pictureFile) return toast.error("Choose an image first");

    setUploading(true);

    try {
      const fd = new FormData();
      fd.append("profilePic", pictureFile);

      const { data } = await API.post("/profile/upload-picture", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Profile picture updated");

      if (data.user) {
        setUser(data.user);

        // Set correct image URL
        setPreviewPic(getImageUrl(data.user.profilePic));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (!user) return <div className="p-6">Loading...</div>;

  const initials = getInitials(user.name);

  // ------------ UI ------------
 return (
  <div className="flex flex-col lg:flex-row gap-8">

    {/* ------- LEFT PROFILE CARD ------- */}
    <div className="w-full lg:w-1/3 bg-white rounded-2xl shadow-md p-6 flex flex-col items-center border">

      {/* Avatar */}
      <div className="w-32 h-32 rounded-full bg-blue-600 text-white flex items-center justify-center 
                      text-4xl font-bold overflow-hidden shadow-lg mb-4">
        {previewPic ? (
          <img
            src={previewPic.startsWith("blob") ? previewPic : getImageUrl(previewPic)}
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          initials
        )}
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-1">
        Dr. {form.name}
      </h2>

      <p className="text-sm text-gray-500">
        {form.specialization || "Specialization not set"}
      </p>

      <p className="text-xs text-gray-400 mb-5">{form.email}</p>

      {/* Hidden input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Buttons */}
      <button
        onClick={openFileDialog}
        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm transition"
      >
        Choose Picture
      </button>

      <button
        onClick={handleUploadPicture}
        disabled={uploading || !pictureFile}
        className={`mt-3 w-full px-4 py-2 rounded-md text-sm text-white transition
          ${
            uploading || !pictureFile
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
      >
        {uploading ? "Uploading..." : "Upload Picture"}
      </button>

      {/* Quick Info */}
      <div className="mt-6 w-full border-t pt-4 text-sm text-gray-700 space-y-2">
        <p className="flex justify-between">
          <span className="font-medium">Experience:</span>
          <span>{form.experience ? `${form.experience} yrs` : "Not set"}</span>
        </p>

        <p className="flex justify-between">
          <span className="font-medium">Consultation Fee:</span>
          <span>{form.consultationFee ? `Rs ${form.consultationFee}` : "Not set"}</span>
        </p>
      </div>
    </div>

    {/* ------- RIGHT FORM ------- */}
    <div className="w-full lg:w-2/3 bg-white rounded-2xl shadow-md p-8 border">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Edit Profile</h2>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Name + Email */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              value={form.email}
              disabled
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-100 text-sm cursor-not-allowed"
            />
          </div>
        </div>

        {/* Phone + Specialization */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Specialization</label>
            <input
              name="specialization"
              value={form.specialization}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Experience + Fee */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Experience (years)</label>
            <input
              type="number"
              name="experience"
              value={form.experience}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Consultation Fee</label>
            <input
              type="number"
              name="consultationFee"
              value={form.consultationFee}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Clinic Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Clinic Address</label>
          <input
            name="clinicAddress"
            value={form.clinicAddress}
            onChange={handleChange}
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Bio / About</label>
          <textarea
            name="bio"
            rows={4}
            value={form.bio}
            onChange={handleChange}
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className={`px-6 py-2 rounded-lg text-white text-sm transition
            ${
              saving
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  </div>
);
};

export default DoctorProfile;
