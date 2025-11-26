import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getPatientAppointmentsApi,
  cancelAppointmentApi,
} from "../../../api/patientApi";
import { useSocketStore } from "../../../stores/socketStore";
import StatusBadge from "../../../components/StatusBadge";
import { getImageUrl } from "../../../utils/imageUrl";

export default function MyAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const socket = useSocketStore((s) => s.socket);

  // -------------------------------
  // SOCKET LISTENER
  // -------------------------------
  useEffect(() => {
    if (!socket) return;

    const handleUpdated = (appointment) => {
      setAppointments((prev) =>
        prev.map((a) => (a._id === appointment._id ? appointment : a))
      );

      if (
        appointment.status === "approved" ||
        appointment.status === "pending_payment"
      ) {
        toast.success("Doctor approved! Redirecting to payment...");
        setTimeout(() => {
          navigate(`/patient-dashboard/pay/${appointment._id}`);
        }, 800);
      }

      if (appointment.status === "rejected") {
        toast.error("Doctor rejected your appointment.");
      }

      if (appointment.status === "booked" && appointment.paymentStatus === "paid") {
        toast.success("Payment successful!");
      }

      if (appointment.status === "cancelled") {
        toast("Appointment cancelled", { icon: "⚠️" });
      }
    };

    socket.on("appointment:updated", handleUpdated);

    return () => socket.off("appointment:updated", handleUpdated);
  }, [socket, navigate]);

  // -------------------------------
  // FETCH APPOINTMENTS
  // -------------------------------
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await getPatientAppointmentsApi();
      setAppointments(data.appointments || []);
    } catch {
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // -------------------------------
  // CANCEL APPOINTMENT
  // -------------------------------
  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;

    try {
      await cancelAppointmentApi(id);
      toast.success("Appointment cancelled");
    } catch {
      toast.error("Failed to cancel");
    }
  };

  // -------------------------------
  // UI RENDER
  // -------------------------------
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">My Appointments</h2>

      {loading ? (
        <p>Loading...</p>
      ) : appointments.length === 0 ? (
        <p className="text-gray-600">No appointments yet.</p>
      ) : (
        <div className="space-y-5">
          {appointments.map((appt) => (
            <div
              key={appt._id}
              className="bg-white p-5 rounded-xl shadow-md border hover:shadow-lg transition"
            >
              <div className="flex items-start gap-4">
                
                {/* Doctor Profile Image */}
                <div className="w-16 h-16 rounded-full overflow-hidden shadow">
                  {appt.doctor?.profilePic ? (
                    <img
                      src={getImageUrl(appt.doctor.profilePic)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white text-xl">
                      {appt.doctor?.name?.[0]}
                    </div>
                  )}
                </div>

                {/* Main details */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold">
                    Dr. {appt.doctor?.name}
                  </h3>
                  <p className="text-gray-600">
                    {appt.doctor?.specialization || "General Physician"}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    <strong>Date:</strong>{" "}
                    {new Date(appt.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>

                  <p className="text-sm text-gray-500">
                    <strong>Time:</strong> {appt.startTime} - {appt.endTime}
                  </p>

                  {appt.reason && (
                    <p className="text-sm text-gray-700 mt-1">
                      <strong>Reason:</strong> {appt.reason}
                    </p>
                  )}

                  <div className="mt-2">
                    <StatusBadge status={appt.status} />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-2">

                  {/* Rejected */}
                  {appt.status === "rejected" && (
                    <span className="text-gray-500 text-sm">No actions</span>
                  )}

                  {/* pending_approval */}
                  {appt.status === "pending_approval" && (
                    <button
                      disabled
                      className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md"
                    >
                      Waiting Approval
                    </button>
                  )}

                  {/* pending_payment */}
                  {appt.status === "pending_payment" && (
                    <button
                      onClick={() => navigate(`/patient-dashboard/pay/${appt._id}`)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                    >
                      Pay Now
                    </button>
                  )}

                  {/* booked */}
                  {appt.status === "booked" && (
                    <button
                      onClick={() => handleCancel(appt._id)}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
