import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { getAllDoctorsApi } from "../../../api/doctorApi";
import { getDoctorAppointmentsApi } from "../../../api/appointmentApi";
import { bookAppointmentApi } from "../../../api/patientApi";

/* --------------------------------------------
   Helper: Generate time slots inside a range
--------------------------------------------- */
function generateSlots(start, end, durationMinutes) {
  const slots = [];
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);

  const startDt = new Date();
  startDt.setHours(sh, sm, 0, 0);

  const endDt = new Date();
  endDt.setHours(eh, em, 0, 0);

  while (startDt < endDt) {
    const next = new Date(startDt.getTime() + durationMinutes * 60000);
    if (next > endDt) break;

    const fmt = (d) => d.toTimeString().slice(0, 5);

    slots.push({
      start: fmt(startDt),
      end: fmt(next),
    });

    startDt.setTime(next.getTime());
  }

  return slots;
}

/* ====================================================
                     MAIN COMPONENT
==================================================== */
export default function BrowseDoctors() {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  // booking states
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [slotDuration, setSlotDuration] = useState(30);

  const [generatedSlots, setGeneratedSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState(new Set());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [patientNote, setPatientNote] = useState("");
  const [confirming, setConfirming] = useState(false);

  /* --------------------------------------------
     Fetch all doctors with availability
  --------------------------------------------- */
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setLoading(true);
        const data = await getAllDoctorsApi();
        setDoctors(data.doctors || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load doctors");
      } finally {
        setLoading(false);
      }
    };
    loadDoctors();
  }, []);

  /* --------------------------------------------
     Generate time slots when doctor/date changes
  --------------------------------------------- */
  useEffect(() => {
    const buildSlots = async () => {
      setGeneratedSlots([]);
      setBookedSlots(new Set());
      setSelectedSlot(null);

      if (!selectedDoctor || !selectedDate) return;

      const weekday = new Date(selectedDate).toLocaleString("en-US", {
        weekday: "long",
      });

      const dayObj = (selectedDoctor.slots || []).find((s) => s.day === weekday);

      if (!dayObj || !dayObj.times || dayObj.times.length === 0) {
        setGeneratedSlots([]);
        return;
      }

      let allSlots = [];
      for (let t of dayObj.times) {
        const slots = generateSlots(t.start, t.end, slotDuration);
        allSlots = allSlots.concat(slots);
      }

      try {
        const res = await getDoctorAppointmentsApi(selectedDoctor._id, selectedDate);
        const appts = res.appointments || [];

        const booked = new Set(appts.map((a) => a.startTime));
        setBookedSlots(booked);
      } catch (err) {
        console.error(err);
        toast.error("Could not load bookings for this doctor");
      }

      setGeneratedSlots(allSlots);
    };

    buildSlots();
  }, [selectedDoctor, selectedDate, slotDuration]);

  /* --------------------------------------------
     Open modal for selected doctor
  --------------------------------------------- */
  const openBooking = (doctor) => {
    setSelectedDoctor(doctor);
    setSelectedDate("");
    setGeneratedSlots([]);
    setBookedSlots(new Set());
    setSelectedSlot(null);
    setPatientNote("");
  };

  /* --------------------------------------------
     CONFIRM BOOKING (pending_approval)
--------------------------------------------- */
  const handleConfirm = async () => {
    if (!selectedSlot) {
      toast.error("Please select a time slot.");
      return;
    }

    setConfirming(true);
    try {
      const res = await bookAppointmentApi({
        doctorId: selectedDoctor._id,
        date: selectedDate,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
        reason: patientNote,
      });

      const appointment = res.appointment;
      const appointmentId = res.appointmentId;

      // close modal and blur
      setSelectedDoctor(null);

      toast.success("Appointment created! Waiting for doctor approval.");

      // NO slot blocking → pending_approval shouldn't block slots visually

      // redirect to patient appointment list
      navigate("/patient-dashboard/appointments");

    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Booking failed");
    } finally {
      setConfirming(false);
    }
  };

  /* ====================================================
                      UI RENDER
  ===================================================== */
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Browse Doctors</h2>

      {/* Doctor Cards */}
      {loading ? (
        <p>Loading doctors...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {doctors.map((doc) => (
            <div
              key={doc._id}
              className="p-5 rounded-xl bg-white shadow-md hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{doc.name}</h3>
                  <p className="text-gray-600">{doc.email}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {doc.bio || "No bio available."}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">
                    {doc.specialization || "Doctor"}
                  </div>
                  <div className="mt-2 text-sm text-gray-700 font-semibold">
                    ${doc.price ?? "20"}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => openBooking(doc)}
                  className="ml-auto bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
                >
                  Book Appointment
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Popup Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border animate-[fadeIn_0.25s_ease] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <h3 className="text-lg font-semibold">
                Book Appointment — Dr. {selectedDoctor.name}
              </h3>
              <button
                onClick={() => setSelectedDoctor(null)}
                className="text-white hover:text-gray-300 text-xl"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-5 max-h-[75vh] overflow-y-auto">
              {/* Date + Duration Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="text-sm font-medium">Select Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="mt-1 border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Slot Duration</label>
                  <select
                    value={slotDuration}
                    onChange={(e) => setSlotDuration(Number(e.target.value))}
                    className="mt-1 border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>60 minutes</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end">
                  <p className="text-sm text-gray-600">
                    <strong>Weekly Availability: </strong>
                    {selectedDoctor.slots?.length ? (
                      <span className="text-green-600">Available</span>
                    ) : (
                      <span className="text-red-500">Unavailable</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Slots */}
              <div className="mb-6">
                <h4 className="text-md font-semibold mb-2">Available Slots</h4>

                {!selectedDate ? (
                  <p className="text-gray-500 text-sm">Select a date to view slots.</p>
                ) : generatedSlots.length === 0 ? (
                  <p className="text-red-500 text-sm">No available slots on this date.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {generatedSlots.map((slot) => {
                      const isBooked = bookedSlots.has(slot.start);

                      return (
                        <button
                          key={slot.start}
                          disabled={isBooked}
                          onClick={() => !isBooked && setSelectedSlot(slot)}
                          className={`p-3 rounded-lg border text-sm transition shadow-sm
                            ${
                              isBooked
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : selectedSlot?.start === slot.start
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white hover:bg-blue-50"
                            }
                          `}
                        >
                          {slot.start} - {slot.end}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Booking Details */}
              <div className="border-t pt-5">
                <h4 className="text-md font-semibold mb-3">Booking Details</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Selected Slot</label>
                    <div className="mt-1 p-3 bg-gray-100 rounded-lg">
                      {selectedSlot ? (
                        <span>
                          {selectedSlot.start} - {selectedSlot.end} on{" "}
                          <strong>{selectedDate}</strong>
                        </span>
                      ) : (
                        <span className="text-gray-500">No slot selected</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Reason / Note</label>
                    <input
                      type="text"
                      value={patientNote}
                      onChange={(e) => setPatientNote(e.target.value)}
                      className="mt-1 border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setSelectedDoctor(null)}
                    className="px-4 py-2 rounded-lg border hover:bg-gray-100"
                  >
                    Close
                  </button>

                  <button
                    onClick={handleConfirm}
                    disabled={!selectedSlot || confirming}
                    className={`px-6 py-2 rounded-lg text-white transition
                      ${
                        !selectedSlot || confirming
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700"
                      }
                    `}
                  >
                    {confirming ? "Booking..." : "Confirm Booking"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
