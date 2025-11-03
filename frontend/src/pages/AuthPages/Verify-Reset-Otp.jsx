import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { verifyResetOtpApi, resendOtpApi } from "../../api/authApi";

const VerifyResetOtp = () => {
  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  // Redirect if email missing
  useEffect(() => {
    if (!email) {
      toast.error("Session expired — please enter email again");
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  // Timer for resend button
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => setResendTimer((sec) => sec - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [resendTimer]);

  // ✅ Verify Reset OTP Mutation
  const verifyOtpMutation = useMutation({
    mutationFn: verifyResetOtpApi,
    onSuccess: () => {
      toast.success("OTP Verified ✅ Reset your password");
      navigate("/reset-password", { state: { email } });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Invalid or expired OTP");
    },
  });

  // ✅ Resend OTP Mutation (same API as normal resend)
  const resendOtpMutation = useMutation({
    mutationFn: resendOtpApi,
    onSuccess: () => {
      toast.success("New OTP sent to your email");
      setResendTimer(30);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!otp) return toast.error("Enter OTP");
    verifyOtpMutation.mutate({ email, otp });
  };

  const handleResend = () => {
    if (resendTimer === 0) {
      resendOtpMutation.mutate({ email });
    }
  };

  if (!email) return null;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-96"
      >
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-3">
          Verify Reset OTP
        </h2>
        <p className="text-gray-600 text-center text-sm mb-5">
          Enter the OTP sent to <b>{email}</b> to reset your password
        </p>

        <input
          type="text"
          placeholder="Enter OTP"
          className="w-full p-3 border rounded mb-4"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        <button
          type="submit"
          disabled={verifyOtpMutation.isPending}
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"
        >
          {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
        </button>

        <div className="text-center mt-4">
          <button
            type="button"
            disabled={resendTimer > 0}
            onClick={handleResend}
            className={`text-blue-600 text-sm hover:underline ${
              resendTimer > 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VerifyResetOtp;
