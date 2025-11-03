import { useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { signupApi } from "../../api/authApi";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  // form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");

  // password validation
  const passwordRegex = useMemo(
    () => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/,
    []
  );
  const isPasswordValid = passwordRegex.test(password);

  // mutation to call signup endpoint
  const signupMutation = useMutation({
    mutationFn: signupApi,
    onSuccess: (data) => {
      toast.success("Signup successful! Please verify your email");
      navigate("/verify-otp", { state: { email, fromSignup: true } });
    },
    onError: async (error) => {
      const status = error.response?.status;
      const serverMsg = error.response?.data?.message;
      const errorMessage =
        status === 422
          ? "Please check your inputs and try again."
          : status === 500
          ? "Server error. Please try again later."
          : serverMsg || "Signup failed";

      // If account exists, redirect to verify without auto-resend
      if (error.response?.status === 400 && /already registered/i.test(errorMessage)) {
        toast.info("Account exists but not verified. Please verify your email.");
        navigate("/verify-otp", { state: { email, fromSignup: true } });
        return;
      }

      // Handle unverified-type wording
      if (/unverified|verify/i.test(errorMessage)) {
        toast.info("Account exists but not verified. Redirecting to verification...");
        navigate("/verify-otp", { state: { email, fromSignup: true } });
        return;
      }

      // Other errors
      toast.error(errorMessage);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Form validation
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    if (!isPasswordValid) {
      toast.error(
        "Password must be at least 8 characters and include uppercase, lowercase, number and special character"
      );
      return;
    }

    // Prevent duplicate submissions
    if (signupMutation.isPending) return;

    // Submit form
    signupMutation.mutate({ 
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role 
    });
  };


  const isSubmitting = signupMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white w-full max-w-md p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-4 text-gray-700">
          Create an account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Full name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your Name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@gmail.com"
              required
            />
          </div>

            <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Create a strong password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>
            <p className="text-xs mt-2 text-gray-500">
              Password should be at least 8 characters and include uppercase, lowercase, number and special character.
            </p>
            {!isPasswordValid && password.length > 0 && (
              <p className="text-xs mt-1 text-red-500">Password does not meet requirements</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Role</label>
            <div className="flex gap-4">
              <label className={`px-3 py-2 rounded-lg border cursor-pointer ${role === "patient" ? "bg-blue-50 border-blue-400" : ""}`}>
                <input
                  type="radio"
                  name="role"
                  value="patient"
                  checked={role === "patient"}
                  onChange={() => setRole("patient")}
                  className="mr-2"
                />
                Patient
              </label>

              <label className={`px-3 py-2 rounded-lg border cursor-pointer ${role === "doctor" ? "bg-blue-50 border-blue-400" : ""}`}>
                <input
                  type="radio"
                  name="role"
                  value="doctor"
                  checked={role === "doctor"}
                  onChange={() => setRole("doctor")}
                  className="mr-2"
                />
                Doctor
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={!isPasswordValid || isSubmitting}
            className={`w-full py-2 rounded-lg text-white font-semibold ${
              !isPasswordValid || isSubmitting
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {isSubmitting ? "Creating account..." : "Sign up"}
          </button>

          <p className="text-sm text-center text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-500 hover:underline">
            Log in
            </Link>
          </p>

        </form>
      </div>
    </div>
  );
}
