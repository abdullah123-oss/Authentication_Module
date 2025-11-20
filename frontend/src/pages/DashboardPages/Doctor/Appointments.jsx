import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getDoctorAppointmentsApi,
  approveAppointmentApi,
  rejectAppointmentApi,
  cancelAppointmentApi,
} from "../../../api/appointmentApi";
import { useSocketStore } from "../../../stores/socketStore";
import StatusBadge from "../../../components/StatusBadge";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const socket = useSocketStore((s) => s.socket);

  // ---------------------------------------------------
  // SOCKET HANDLERS (REAL TIME)
  // ---------------------------------------------------
  useEffect(() => {
    if (!socket) return;

    // 🔵 NEW appointment arrives
    const handleNew = (appt) => {
      toast.success("New appointment request received");

      setAppointments((prev) => {
        const exists = prev.some((a) => a._id === appt._id);
        return exists ? prev : [...prev, appt];
      });
    };

    // 🔵 Appointment updated (approve/reject/cancel/payment)
    const handleUpdated = (appointment) => {
      setAppointments((prev) =>
        prev.map((a) => (a._id === appointment._id ? appointment : a))
      );
    };
    socket.on("appointment:new", handleNew);
    socket.on("appointment:updated", handleUpdated);

    return () => {
      socket.off("appointment:new", handleNew);
      socket.off("appointment:updated", handleUpdated);
    };
  }, [socket]);

  // ---------------------------------------------------
  // FETCH INITIAL
  // ---------------------------------------------------
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await getDoctorAppointmentsApi();
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

  // ---------------------------------------------------
  // APPROVE
  // ---------------------------------------------------
  const handleApprove = async (id) => {
    try {
      await approveAppointmentApi(id);
      toast.success("Appointment approved — waiting for payment");
    } catch {
      toast.error("Failed to approve");
    }
  };

  // ---------------------------------------------------
  // REJECT
  // ---------------------------------------------------
  const handleReject = async (id) => {
    if (!window.confirm("Reject this appointment?")) return;
    try {
      await rejectAppointmentApi(id);
      toast("Appointment rejected", { icon: "❌" });
    } catch {
      toast.error("Failed to reject");
    }
  };

  // ---------------------------------------------------
  // CANCEL
  // ---------------------------------------------------
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
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold mb-4">My Appointments</h2>

      {loading ? (
        <p>Loading...</p>
      ) : appointments.length === 0 ? (
        <p>No appointments yet</p>
      ) : (
        appointments.map((appt) => (
          <div
            key={appt._id}
            className="bg-white shadow-md rounded-lg p-4 border border-gray-200"
          >
            <div className="flex justify-between items-center mb-3">
              <div className="text-lg font-medium">{appt.patient?.name}</div>
              <StatusBadge status={appt.status} />
            </div>

            <div className="text-sm text-gray-700 space-y-1">
              <p>
                <strong>Date:</strong>{" "}
                {new Date(appt.date).toLocaleDateString()}
              </p>

              <p>
                <strong>Time:</strong> {appt.startTime} - {appt.endTime}
              </p>

              {appt.reason && (
                <p>
                  <strong>Reason:</strong> {appt.reason}
                </p>
              )}

              <p>
                <strong>Payment:</strong>{" "}
                {appt.paymentStatus === "paid" ? (
                  <span className="text-green-700 font-medium">Paid</span>
                ) : (
                  <span className="text-yellow-700">Unpaid</span>
                )}
              </p>
            </div>

            {/* ACTION BUTTONS */}
            <div className="mt-4 flex gap-3">
              {appt.status === "pending_approval" && (
                <>
                  <button
                    onClick={() => handleApprove(appt._id)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(appt._id)}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Reject
                  </button>
                </>
              )}

              {appt.status === "booked" && (
                <button
                  onClick={() => handleCancel(appt._id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
