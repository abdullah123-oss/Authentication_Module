// src/pages/DashboardPages/Patient/CheckoutMedicines.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import toast from "react-hot-toast";

import { getCartApi } from "../../../api/cartApi";
import { createPaymentIntentApi } from "../../../api/orderApi";

import { useQueryClient } from "@tanstack/react-query";
import { useCartStore } from "../../../stores/cartStore";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

/* ------------------------------------------------------
   INNER PAYMENT FORM
------------------------------------------------------ */
function CheckoutInner({ cart }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const queryClient = useQueryClient();
  const clearCount = useCartStore((s) => s.clearCount);

  const [clientSecret, setClientSecret] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Create Payment Intent
  useEffect(() => {
    const loadIntent = async () => {
      try {
        const { clientSecret } = await createPaymentIntentApi(cart);
        setClientSecret(clientSecret);
      } catch (err) {
        toast.error("Failed to initialize payment.");
      }
    };
    loadIntent();
  }, [cart]);

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

      if (res.paymentIntent.status === "succeeded") {
        toast.success("Payment successful!");

        /* ----------------------------------------
           FIX: CLEAR CART IN FRONTEND RIGHT AWAY
        ---------------------------------------- */
        queryClient.invalidateQueries(["cart"]); // refresh React Query
        clearCount(); // clear zustand badge count

        // redirect
        setTimeout(() => {
          navigate("/patient-dashboard/orders");
        }, 1200);
      }
    } catch (err) {
      toast.error("Payment failed");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-lg border mt-8">

      {/* CART SUMMARY */}
      <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

      <div className="space-y-4 mb-6">
        {cart.items.map((item) => (
          <div
            key={item.medicineId}
            className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border"
          >
            <img
              src={item.image ? `http://localhost:5000${item.image}` : "/no-image.png"}
              className="w-16 h-16 object-contain bg-white rounded-lg border"
            />
            <div className="flex-1">
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
            </div>
            <p className="font-semibold text-blue-600">
              Rs {item.price * item.quantity}
            </p>
          </div>
        ))}
      </div>

      {/* TOTAL */}
      <div className="p-4 bg-blue-50 rounded-xl text-lg font-semibold text-blue-700 mb-6 border">
        Total: Rs {cart.totalAmount}
      </div>

      {/* CARD INPUT */}
      <div className="p-4 border rounded-xl bg-white shadow-sm mb-6">
        <CardElement
          options={{
            style: {
              base: { fontSize: "16px", color: "#333" },
              "::placeholder": { color: "#999" },
            },
          }}
        />
      </div>

      {/* BUTTON */}
      <button
        onClick={handlePay}
        disabled={processing}
        className={`w-full py-3 rounded-lg text-white text-lg transition ${
          processing ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {processing ? "Processing..." : "Pay Now"}
      </button>
    </div>
  );
}

/* ------------------------------------------------------
   OUTER WRAPPER — loads cart + wraps Stripe
------------------------------------------------------ */
export default function CheckoutMedicines() {
  const [cart, setCart] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const data = await getCartApi();

      if (!data.items || data.items.length === 0) {
        toast.error("Your cart is empty");
        navigate("/patient-dashboard/cart");
        return;
      }

      setCart(data);
    };
    load();
  }, [navigate]);

  if (!cart) return <p className="text-center p-6">Loading checkout...</p>;

  return (
    <Elements stripe={stripePromise}>
      <CheckoutInner cart={cart} />
    </Elements>
  );
}
