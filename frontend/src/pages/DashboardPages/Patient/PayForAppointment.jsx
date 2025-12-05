// frontend/src/pages/DashboardPages/Patient/PayForAppointment.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import API from "../../../api/axios";
import { getImageUrl } from "../../../utils/imageUrl";
import toast from "react-hot-toast";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

/* ------------------------------------------------------
   CARD PAYMENT FORM (INSIDE STRIPE <Elements>)
------------------------------------------------------ */
function CheckoutInner({ appointment }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [clientSecret, setClientSecret] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Create payment intent
  useEffect(() => {
    const createIntent = async () => {
      try {
        if (appointment.paymentStatus === "paid") {
          toast.success("This appointment is already paid.");
          navigate("/patient-dashboard/appointments");
          return;
        }

        const { data } = await API.post("/payments/create-payment-intent", {
          appointmentId: appointment._id,
        });

        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error(err);
        toast.error("Failed to prepare payment.");
      }
    };

    createIntent();
  }, [appointment, navigate]);

  const handlePay = async () => {
    if (!stripe || !elements || !clientSecret) return;
    setProcessing(true);

    try {
      const card = elements.getElement(CardElement);
      const res = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card },
      });

      if (res.error) {
        toast.error(res.error.message || "Payment failed");
        setProcessing(false);
        return;
      }

      if (res.paymentIntent?.status === "succeeded") {
        toast.success("Payment successful! Finalizing...");
        setTimeout(() => {
          navigate("/patient-dashboard/appointments");
        }, 1500);
      }
    } catch (err) {
      toast.error("Payment failed");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white rounded-2xl shadow-xl p-8 border">

      {/* Doctor Info Section */}
      <div className="flex items-center gap-4 mb-6 border-b pb-4">
        <div className="w-16 h-16 rounded-full overflow-hidden shadow">
          {appointment.doctor?.profilePic ? (
            <img
              src={getImageUrl(appointment.doctor.profilePic)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-blue-600 text-white text-xl flex items-center justify-center">
              {appointment.doctor?.name?.[0]}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold">Dr. {appointment.doctor?.name}</h3>
          <p className="text-sm text-gray-600">{appointment.doctor?.specialization}</p>
          <p className="text-xs text-gray-500">{appointment.doctor?.email}</p>
        </div>
      </div>

      {/* Appointment Summary */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm">
        <p><strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> {appointment.startTime} - {appointment.endTime}</p>
        <p><strong>Fee:</strong> Rs {appointment.amount?.toFixed(2)}</p>
        {appointment.reason && (
          <p><strong>Reason:</strong> {appointment.reason}</p>
        )}
      </div>

      {/* Stripe Card Input */}
      <div className="p-4 border rounded-xl bg-white shadow-sm mb-6">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#333",
                "::placeholder": { color: "#aaa" },
              },
            },
          }}
        />
      </div>

      {/* Secure Payment Badge */}
      <div className="text-center text-xs text-gray-500 mb-4">
        🔒 Secure Payment — SSL Encrypted
      </div>

      {/* Pay Button */}
      <button
        onClick={handlePay}
        disabled={!stripe || processing}
        className={`w-full py-3 rounded-lg text-white text-lg shadow transition 
          ${processing ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
      >
        {processing
          ? "Processing payment..."
          : `Pay Rs ${appointment.amount?.toFixed(2)}`}
      </button>
    </div>
  );
}

/* ------------------------------------------------------
   OUTER COMPONENT — Loads appointment & wraps in <Elements>
------------------------------------------------------ */
export default function PayForAppointment() {
  const { appointmentId } = useParams();
  const [appointment, setAppointment] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await API.get(`/appointments/patient`);
        const appts = data.appointments || [];

        const found = appts.find((a) => a._id === appointmentId);

        if (!found) {
          toast.error("Appointment not found");
          navigate("/patient-dashboard/appointments");
          return;
        }

        setAppointment(found);
      } catch (err) {
        toast.error("Failed to load appointment");
      }
    };

    load();
  }, [appointmentId, navigate]);

  if (!appointment)
    return <p className="text-center p-6">Loading payment page…</p>;

  return (
    <Elements stripe={stripePromise}>
      <CheckoutInner appointment={appointment} />
    </Elements>
  );
}
