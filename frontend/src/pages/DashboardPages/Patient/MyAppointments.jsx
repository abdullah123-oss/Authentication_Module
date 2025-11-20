import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getPatientAppointmentsApi,
  cancelAppointmentApi,
} from "../../../api/patientApi";
import { useSocketStore } from "../../../stores/socketStore";
import StatusBadge from "../../../components/StatusBadge";

export default function MyAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const socket = useSocketStore((s) => s.socket);

// SOCKET HANDLERS
useEffect(() => {
  if (!socket) return;

  const handleUpdated = (appointment) => {
    setAppointments((prev) =>
      prev.map((a) => (a._id === appointment._id ? appointment : a))
    );

    // 🔥 1) APPROVED → redirect to payment
    if (
      appointment.status === "approved" ||
      appointment.status === "pending_payment"
    ) {
      toast.success("Doctor approved! Redirecting to payment...");
      setTimeout(() => {
        navigate(`/patient-dashboard/pay/${appointment._id}`);
      }, 800);
    }

    // 🔥 2) REJECTED
    if (appointment.status === "rejected") {
      toast.error("Doctor rejected your appointment.");
    }

    // 🔥 3) PAYMENT SUCCESS
    if (appointment.status === "booked" && appointment.paymentStatus === "paid") {
      toast.success("Payment successful!");
    }

    // 🔥 4) CANCELLED
    if (appointment.status === "cancelled") {
      toast("Appointment cancelled", { icon: "⚠️" });
    }
  };

  socket.on("appointment:updated", handleUpdated);

  return () => {
    socket.off("appointment:updated", handleUpdated);
  };
}, [socket, navigate]);

  // ----------------------------------------
  // FETCH APPOINTMENTS
  // ----------------------------------------
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

  // ----------------------------------------
  // CANCEL
  // ----------------------------------------
  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;

    try {
      await cancelAppointmentApi(id);
      toast.success("Appointment cancelled");
    } catch {
      toast.error("Failed to cancel");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">My Appointments</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="min-w-full bg-white border rounded">
          <thead>
            <tr>
              <th className="border p-2">Date</th>
              <th className="border p-2">Time</th>
              <th className="border p-2">Doctor</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {appointments.map((appt) => (
              <tr key={appt._id} className="text-center">
                <td className="border p-2">
                  {new Date(appt.date).toLocaleDateString()}
                </td>

                <td className="border p-2">
                  {appt.startTime} - {appt.endTime}
                </td>

                <td className="border p-2">{appt.doctor?.name}</td>

                <td className="border p-2">
                  <StatusBadge status={appt.status} />
                </td>

                <td className="border p-2">
                  {/* REJECTED */}
                  {appt.status === "rejected" && <span>No actions</span>}

                  {/* pending_approval */}
                  {appt.status === "pending_approval" && (
                    <button disabled className="bg-gray-400 text-white px-3 py-1 rounded">
                      Waiting Approval
                    </button>
                  )}

                  {/* pending_payment: show Pay */}
                  {appt.status === "pending_payment" && (
                    <button
                      onClick={() =>
                        navigate(`/patient-dashboard/pay/${appt._id}`)
                      }
                      className="bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Pay Now
                    </button>
                  )}

                  {/* booked → cancel */}
                  {appt.status === "booked" && (
                    <button
                      onClick={() => handleCancel(appt._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
