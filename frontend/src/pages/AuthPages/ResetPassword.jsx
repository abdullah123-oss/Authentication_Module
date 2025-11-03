import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { resetPasswordApi } from "../../api/authApi";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email; // email passed from OTP page

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Password Validation Regex (same as signup)
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
  const isPasswordValid = passwordRegex.test(password);

  // redirect if email missing
  useEffect(() => {
    if (!email) {
      toast.error("Session expired — Please try again");
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: resetPasswordApi,
    onSuccess: () => {
      toast.success("Password reset successful ✅ Login now");
      navigate("/login");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to reset password"
      );
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isPasswordValid) {
      toast.error("Password must meet security requirements");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (resetPasswordMutation.isPending) return;

    // Backend expects 'newPassword'
    resetPasswordMutation.mutate({ email, newPassword: password });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-2 text-center text-blue-600">
          Reset Password
        </h2>
        <p className="text-gray-600 text-sm text-center mb-6">
          Enter your new password for <b>{email}</b>
        </p>

        <input
          type="password"
          placeholder="New Password"
          className="w-full p-3 border rounded-lg mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {!isPasswordValid && password.length > 0 && (
          <p className="text-xs text-red-500 mb-2">
            Must include uppercase, lowercase, number & special character
          </p>
        )}

        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full p-3 border rounded-lg mb-4"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={resetPasswordMutation.isPending}
          className={`w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition ${
            resetPasswordMutation.isPending && "opacity-50 cursor-not-allowed"
          }`}
        >
          {resetPasswordMutation.isPending
            ? "Resetting..."
            : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
