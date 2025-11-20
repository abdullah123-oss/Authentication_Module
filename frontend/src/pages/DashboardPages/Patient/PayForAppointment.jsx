// frontend/src/pages/DashboardPages/Patient/PayForAppointment.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import API from "../../../api/axios";
import toast from "react-hot-toast";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function CheckoutInner({ appointment }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

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
        toast.error(err?.response?.data?.message || "Failed to prepare payment");
      }
    };

    if (appointment) createIntent();
  }, [appointment, navigate]);

  const handlePay = async () => {
    if (!stripe || !elements || !clientSecret) return;

    setLoading(true);
    setProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);

      const res = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
      });

      if (res.error) {
        toast.error(res.error.message || "Payment failed");
        setLoading(false);
        setProcessing(false);
        return;
      }

      // PAYMENT SUCCESS — webhook will update DB
      if (res.paymentIntent && res.paymentIntent.status === "succeeded") {
        toast.success(
          "Payment received! Updating your appointment..."
        );

        // Give webhook time to update the DB
        setTimeout(() => {
          navigate("/patient-dashboard/appointments");
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      toast.error("Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Pay for Appointment</h2>

      <div className="mb-4">
        <div><strong>Doctor:</strong> {appointment.doctor?.name}</div>
        <div><strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()}</div>
        <div><strong>Time:</strong> {appointment.startTime} - {appointment.endTime}</div>
        <div><strong>Amount:</strong> ${appointment.amount?.toFixed(2)}</div>
      </div>

      <div className="mb-4">
        <CardElement className="p-3 border rounded" />
      </div>

      <button
        onClick={handlePay}
        disabled={!stripe || loading || processing}
        className="w-full bg-blue-600 text-white p-3 rounded"
      >
        {processing
          ? "Waiting for confirmation..."
          : loading
          ? "Processing..."
          : `Pay $${appointment.amount?.toFixed(2)}`}
      </button>
    </div>
  );
}

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
        navigate("/patient-dashboard/appointments");
      }
    };
    load();
  }, [appointmentId, navigate]);

  if (!appointment) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutInner appointment={appointment} />
    </Elements>
  );
}
