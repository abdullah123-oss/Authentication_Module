// src/components/DoctorCard.jsx
import React from "react";
import { getImageUrl } from "../utils/imageUrl";
import { FaStethoscope } from "react-icons/fa";

export default function DoctorCard({ doctor, onBook, onView }) {
  return (
    <div
      onClick={onView}
      className="cursor-pointer rounded-xl border bg-white shadow-sm hover:shadow-lg transition p-5 group"
    >
      {/* Top Section */}
      <div className="flex items-start gap-4">
        {/* Doctor Image */}
        <div className="w-20 h-20 rounded-full overflow-hidden shadow-md border">
          {doctor.profilePic ? (
            <img
              src={getImageUrl(doctor.profilePic)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white text-2xl font-semibold">
              {doctor.name?.[0]}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <h3 className="text-lg font-bold group-hover:text-blue-600 transition">
            Dr. {doctor.name}
          </h3>

          <p className="text-gray-600 text-sm flex items-center gap-1">
            <FaStethoscope /> {doctor.specialization || "General Physician"}
          </p>

          {doctor.experience && (
            <p className="text-sm text-gray-500 mt-1">
              {doctor.experience} yrs experience
            </p>
          )}

          <p className="mt-1 text-gray-700 text-sm">
            Fee:{" "}
            <span className="font-semibold text-gray-900">
              ${doctor.consultationFee || 20}
            </span>
          </p>
        </div>
      </div>

      {/* Bottom: Book Button */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // prevent opening details page
          onBook(doctor);
        }}
        className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
      >
        Book Appointment
      </button>
    </div>
  );
}
