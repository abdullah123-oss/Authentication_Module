import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { verifyOtpApi, resendOtpApi } from "../../api/authApi";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  // Timer for resend button
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendTimer]);

  // Check for email presence
  useEffect(() => {
    if (!email) {
      toast.error("Email not found — please signup again");
      navigate("/signup");
      return;
    }
    // Start timer when component mounts
    setResendTimer(30);
  }, [email, navigate]);

  // Removed auto-resend: OTP is sent by backend on successful signup

  // Verify OTP mutation
  const verifyOtpMutation = useMutation({
    mutationFn: verifyOtpApi,
    onSuccess: (data) => {
      console.log('Verification successful:', data);
      toast.success("Email verified successfully! Please login");
      navigate("/login");
    },
    onError: (error) => {
      console.error('Verification error:', error.response?.data);
      const status = error.response?.status;
      const serverMsg = error.response?.data?.message;
      const errorMessage =
        status === 400 && /invalid|expired/i.test(serverMsg || '')
          ? "Invalid or expired OTP. Please request a new code."
          : serverMsg || "Invalid OTP. Please try again.";
      toast.error(errorMessage);
      setOtp(""); // Clear OTP input on error
    },
  });

  // Resend OTP mutation
  const resendOtpMutation = useMutation({
    mutationFn: resendOtpApi,
    onSuccess: (data) => {
      console.log('OTP resent successfully:', data);
      toast.success("New OTP sent to your email");
      setResendTimer(50); // Reset timer
      setOtp(""); // Clear previous OTP
    },
    onError: (error) => {
      console.error('Resend error:', error.response?.data);
      const status = error.response?.status;
      const serverMsg = error.response?.data?.message;
      const errorMessage =
        status === 429
          ? "Too many attempts. Please wait and try again."
          : status === 500 && /mail|smtp|send/i.test(serverMsg || '')
          ? "Email service error. Please try again later."
          : serverMsg || "Failed to resend OTP";
      toast.error(errorMessage);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Email not found");
      navigate('/signup');
      return;
    }

    if (!otp || otp.length === 0) {
      toast.error("Please enter OTP");
      return;
    }

    // Log verification attempt
    console.log('Attempting to verify OTP for:', email);
    
    verifyOtpMutation.mutate({ 
      email, 
      otp: otp.trim() // Clean OTP input
    });
  };

  // Simple debounce + rate limit: max 3 resends per 10 minutes
  const [resendWindowStart, setResendWindowStart] = useState(0);
  const [resendCount, setResendCount] = useState(0);
  const RESEND_WINDOW_MS = 10 * 60 * 1000;
  const RESEND_MAX = 3;

  const handleResendOtp = () => {
    if (resendTimer > 0 || resendOtpMutation.isPending) return;
    
    if (!email) {
      toast.error("Email not found");
      navigate('/signup');
      return;
    }

    const now = Date.now();
    if (now - resendWindowStart > RESEND_WINDOW_MS) {
      setResendWindowStart(now);
      setResendCount(0);
    }
    if (resendCount >= RESEND_MAX) {
      toast.error("You’ve reached the resend limit. Please wait a few minutes.");
      return;
    }

    // Log resend attempt
    console.log('Requesting new OTP for:', email);
    setResendCount((c) => c + 1);
    resendOtpMutation.mutate({ email });
  };

  // Early return if no email
  if (!email) return null;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-2 text-center text-blue-600">
          Verify Your Email
        </h2>
        <p className="text-gray-600 text-sm text-center mb-6">
          Enter the OTP sent to <span className="font-medium">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Enter OTP"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            required
          />

          <button
            type="submit"
            disabled={verifyOtpMutation.isPending || !otp}
            className={`w-full py-2 text-white font-semibold rounded-lg ${
              verifyOtpMutation.isPending || !otp
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
          </button>

          <div className="text-center mt-4">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendTimer > 0 || resendOtpMutation.isPending || resendCount >= RESEND_MAX}
              className={`text-blue-600 text-sm hover:underline ${
                resendTimer > 0 || resendOtpMutation.isPending || resendCount >= RESEND_MAX
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {resendCount >= RESEND_MAX
                ? "Resend limit reached"
                : resendTimer > 0
                ? `Resend OTP in ${resendTimer}s`
                : resendOtpMutation.isPending
                ? "Sending..."
                : "Resend OTP"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyOtp;