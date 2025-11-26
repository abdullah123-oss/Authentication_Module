import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDoctorByIdApi } from "../../../api/doctorApi";
import { getImageUrl } from "../../../utils/imageUrl";
import { FaMapMarkerAlt, FaUserMd, FaClock } from "react-icons/fa";

export default function DoctorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch doctor
  useEffect(() => {
    const loadDoctor = async () => {
      try {
        const data = await getDoctorByIdApi(id);
        setDoctor(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadDoctor();
  }, [id]);

  if (loading) return <p className="text-center mt-10">Loading doctor...</p>;
  if (!doctor) return <p className="text-center mt-10">Doctor not found</p>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-2">   {/* ⬅ Reduced top space (py-2 instead of py-8) */}

      {/* Back Button */}
      <button
        onClick={() => navigate("/patient-dashboard/browse-doctors")}
        className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm"
      >
        ← Back to Doctors
      </button>

      {/* MAIN CARD */}
      <div className="bg-white p-8 rounded-2xl shadow-lg border">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center gap-8">

          {/* Profile Image */}
          <div className="w-32 h-32 rounded-full overflow-hidden shadow-lg border">
            {doctor.profilePic ? (
              <img
                src={getImageUrl(doctor.profilePic)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white text-4xl">
                {doctor.name[0]}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-800">
              Dr. {doctor.name}
            </h1>

            <p className="text-blue-600 text-lg font-medium mt-1 flex items-center justify-center md:justify-start gap-2">
              <FaUserMd /> {doctor.specialization || "General Physician"}
            </p>

            <p className="text-gray-500 mt-1">{doctor.email}</p>

            {/* Badges */}
            <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">

              <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                {doctor.experience || 0} yrs Experience
              </div>

              <div className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                Fee: ${doctor.consultationFee || 20}
              </div>

              <div className="px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium flex items-center gap-2">
                <FaMapMarkerAlt className="text-purple-600" />
                {doctor.clinicAddress || "Clinic not set"}
              </div>

            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">About Doctor</h2>
          <p className="text-gray-600 leading-relaxed">
            {doctor.bio || "No bio available."}
          </p>
        </div>

        {/* Availability Section */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">Weekly Availability</h2>

          {doctor.slots?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctor.slots.map((d, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-xl border shadow-sm">
                  <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FaClock className="text-blue-600" /> {d.day}
                  </h3>

                  {d.times.map((t, i) => (
                    <p key={i} className="text-gray-600 text-sm">
                      {t.start} - {t.end}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Doctor has not set availability yet.</p>
          )}
        </div>

        {/* ❌ Removed Book Appointment button */}

      </div>
    </div>
  );
}
