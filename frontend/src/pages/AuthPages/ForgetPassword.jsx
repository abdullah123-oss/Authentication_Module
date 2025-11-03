import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { forgotPasswordApi } from "../../api/authApi";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const forgotPasswordMutation = useMutation({
    mutationFn: forgotPasswordApi,
    onSuccess: () => {
      toast.success("OTP sent to your email");
      navigate("/verify-reset-otp", { state: { email } });
    },
    onError: (error) => {
      const msg = error.response?.data?.message || "Failed to send OTP";
      toast.error(msg);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    forgotPasswordMutation.mutate({ email });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-2 text-center text-blue-600">
          Forgot Password
        </h2>
        <p className="text-gray-600 text-sm text-center mb-6">
          Enter your email to receive OTP for password reset
        </p>

        <input
          type="email"
          placeholder="Enter your email"
          className="w-full p-3 border rounded-lg mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
          disabled={forgotPasswordMutation.isPending}
        >
          {forgotPasswordMutation.isPending ? "Sending OTP..." : "Send OTP"}
        </button>

        <p className="text-center mt-4 text-sm">
          Remember password?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-blue-600 cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
};

export default ForgotPassword;
