import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getDoctorAppointmentsApi,
  approveAppointmentApi,
  rejectAppointmentApi,
  cancelAppointmentApi,
} from "../../../api/appointmentApi";
import { downloadAppointmentInvoiceApi } from "../../../api/invoiceApi";
import fileDownload from "js-file-download";

import { useSocketStore } from "../../../stores/socketStore";
import StatusBadge from "../../../components/StatusBadge";
import { FaCalendarAlt, FaClock, FaMoneyBill, FaUser, FaClipboardList } from "react-icons/fa";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const socket = useSocketStore((s) => s.socket);

  // ---------------- SOCKET -------------------
  useEffect(() => {
    if (!socket) return;

    const handleNew = (appt) => {
      toast.success("New appointment request received");
      setAppointments((prev) =>
        prev.some((a) => a._id === appt._id) ? prev : [...prev, appt]
      );
    };

    const handleUpdated = (appt) => {
      setAppointments((prev) =>
        prev.map((a) => (a._id === appt._id ? appt : a))
      );
    };

    socket.on("appointment:new", handleNew);
    socket.on("appointment:updated", handleUpdated);

    return () => {
      socket.off("appointment:new", handleNew);
      socket.off("appointment:updated", handleUpdated);
    };
  }, [socket]);

  // ---------------- FETCH -------------------
  const loadAppointments = async () => {
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
    loadAppointments();
  }, []);

  // ---------------- ACTIONS -------------------
  const approve = async (id) => {
    try {
      await approveAppointmentApi(id);
      toast.success("Appointment approved");
    } catch {
      toast.error("Approval failed");
    }
  };

  const reject = async (id) => {
    if (!window.confirm("Reject this appointment?")) return;

    try {
      await rejectAppointmentApi(id);
      toast("Appointment rejected", { icon: "❌" });
    } catch {
      toast.error("Failed to reject");
    }
  };

  const cancel = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;

    try {
      await cancelAppointmentApi(id);
      toast.success("Appointment cancelled");
    } catch {
      toast.error("Cancel failed");
    }
  };

  const handleDownloadInvoice = async (appointment) => {
    try {
      const res = await downloadAppointmentInvoiceApi(
        appointment._id,
        appointment.invoiceNumber
      );
      fileDownload(
        res.data,
        `AppointmentReceipt-${appointment.invoiceNumber || appointment._id}.pdf`
      );
      toast.success("Invoice downloaded");
    } catch {
      toast.error("Download failed!");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <FaClipboardList className="text-blue-600" />
        Appointments
      </h2>

      {loading ? (
        <p>Loading appointments...</p>
      ) : appointments.length === 0 ? (
        <p>No appointments yet</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {appointments.map((appt) => (
            <div
              key={appt._id}
              className="bg-white rounded-xl shadow-md p-5 border hover:shadow-lg transition-all"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl">
                    {appt.patient?.name?.[0]}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold">
                      {appt.patient?.name}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {appt.patient?.email}
                    </p>
                  </div>
                </div>

                <StatusBadge status={appt.status} />
              </div>

              {/* Info List */}
              <div className="space-y-2 text-gray-700">
                <p className="flex items-center gap-2">
                  <FaCalendarAlt className="text-blue-600" />
                  <strong>Date:</strong>{" "}
                  {new Date(appt.date).toLocaleDateString()}
                </p>

                <p className="flex items-center gap-2">
                  <FaClock className="text-blue-600" />
                  <strong>Time:</strong> {appt.startTime} - {appt.endTime}
                </p>

                {appt.reason && (
                  <p className="flex items-center gap-2">
                    <FaUser className="text-blue-600" />
                    <strong>Reason:</strong> {appt.reason}
                  </p>
                )}

                <p className="flex items-center gap-2">
                  <FaMoneyBill className="text-green-600" />
                  <strong>Payment:</strong>{" "}
                  {appt.paymentStatus === "paid" ? (
                    <span className="text-green-700 font-medium">Paid</span>
                  ) : (
                    <span className="text-yellow-700">Unpaid</span>
                  )}
                </p>
              </div>

              {/* Buttons */}
              <div className="mt-5 flex gap-3">
                {appt.status === "pending_approval" && (
                  <>
                    <button
                      onClick={() => approve(appt._id)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => reject(appt._id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                    >
                      Reject
                    </button>
                  </>
                )}

                {appt.status === "booked" && (
                  <>
                    {appt.paymentStatus === "paid" && (
                      <button
                        onClick={() => handleDownloadInvoice(appt)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                      >
                        Download Invoice
                      </button>
                    )}
                    <button
                      onClick={() => cancel(appt._id)}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
