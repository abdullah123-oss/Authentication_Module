// src/pages/DashboardPages/Patient/Profile.jsx
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../../stores/useAuthStore";
import API from "../../../api/axios";
import { getImageUrl } from "../../../utils/imageUrl";
import { FaCamera, FaUser } from "react-icons/fa";

/**
 * Modern Patient Profile (polished)
 */

const getInitials = (name = "") =>
  name
    .trim()
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default function PatientProfile() {
  const { user, setUser } = useAuthStore();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    bio: "",
  });

  const [preview, setPreview] = useState(null); // can be blob or url
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) return;

    setForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      age: user.age ?? "",
      gender: user.gender || "",
      bio: user.bio || "",
    });

    // keep preview as a full URL if server path exists
    setPreview(user.profilePic ? getImageUrl(user.profilePic) : null);
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        age: form.age,
        gender: form.gender,
        bio: form.bio,
      };
      const { data } = await API.put("/profile/update", payload);
      toast.success("Profile updated");
      if (data.user) setUser(data.user); // update auth store
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const openFile = () => fileRef.current?.click();

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    // client validation
    if (!["image/png", "image/jpeg", "image/jpg"].includes(f.type)) {
      return toast.error("Please select a JPG or PNG image.");
    }
    if (f.size > 2 * 1024 * 1024) {
      return toast.error("Max file size is 2 MB.");
    }

    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleUpload = async () => {
    if (!file) return toast.error("Choose an image first");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("profilePic", file);
      const { data } = await API.post("/profile/upload-picture", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Profile picture uploaded");

      if (data.user) {
        // update store immediately
        setUser(data.user);
        setPreview(getImageUrl(data.user.profilePic));
        setFile(null);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (!user) return <div className="p-6">Loading...</div>;

  const initials = getInitials(user.name);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Profile card */}
        <div className="bg-white rounded-2xl p-6 shadow-lg flex flex-col items-center text-center border">
          <div className="relative w-36 h-36 mb-4">
            <div
              className="w-36 h-36 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100"
              aria-hidden
            >
              {preview ? (
                <img
                  src={
                    // preview can be blob or full URL; if it's a blob string, use directly; otherwise ensure full server URL
                    String(preview).startsWith("blob:")
                      ? preview
                      : getImageUrl(preview)
                  }
                  alt={`${form.name || user.name} avatar`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-blue-600 text-white flex items-center justify-center text-4xl">
                  {initials || <FaUser />}
                </div>
              )}
            </div>

            {/* small camera icon (keyboard accessible) */}
            <button
              onClick={openFile}
              className="absolute -bottom-2 right-0 bg-white p-2 rounded-full shadow hover:scale-105 transition focus:outline-none focus:ring-2 focus:ring-blue-300"
              aria-label="Change profile picture"
            >
              <FaCamera className="text-blue-600" />
            </button>
          </div>

          <h2 className="text-xl font-semibold">{form.name || user.name}</h2>
          <p className="text-sm text-gray-500">{form.email || user.email}</p>

          <div className="mt-6 w-full">
            <div className="flex gap-3">
              <button
                onClick={openFile}
                className="flex-1 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm transition"
                aria-label="Choose picture"
              >
                Choose Picture
              </button>

              <button
                onClick={handleUpload}
                disabled={uploading || !file}
                className={`flex-1 py-2 rounded-lg text-white text-sm transition
                  ${
                    uploading || !file
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  }`}
                aria-disabled={uploading || !file}
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* quick stats */}
            <div className="mt-6 text-left space-y-2 text-sm text-gray-700">
              <div>
                <span className="font-medium">Age:</span>{" "}
                {form.age || "Not set"}
              </div>
              <div>
                <span className="font-medium">Gender:</span>{" "}
                {form.gender || "Not set"}
              </div>
              <div>
                <span className="font-medium">Phone:</span>{" "}
                {form.phone || "Not set"}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Edit form (spans 2 columns on large screens) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border">
          <h3 className="text-lg font-semibold mb-4">Edit Details</h3>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Full name
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Email (read-only)
                </label>
                <input
                  value={form.email}
                  disabled
                  className="w-full border rounded-lg px-4 py-2 bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Phone
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Age</label>
                <input
                  type="number"
                  name="age"
                  value={form.age}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="text-right">
                <button
                  type="submit"
                  disabled={saving}
                  className={`w-full md:w-auto px-6 py-2 rounded-lg text-white transition
                    ${saving ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">About / Bio</label>
              <textarea
                name="bio"
                rows={4}
                value={form.bio}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
