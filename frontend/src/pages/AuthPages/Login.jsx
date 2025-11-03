import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../../stores/useAuthStore";
import { loginApi } from "../../api/authApi";
import { Link } from "react-router-dom";  
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useMutation({
  mutationFn: async () =>
    loginApi({ email, password }),
  onSuccess: (data) => {
    setAuth(data);           // ✅ store user & token in Zustand
    toast.success(data.message);
  navigate(`/${data.user.role}-dashboard`);  // ✅ redirect based on role
},

  onError: (error) => toast.error(error.response?.data?.message || "Login failed"),
});


  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate();
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 px-4">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-700">
          Login 👤
        </h2>

        
        {/* Headings */}
        <p className="text-gray-500 mb-1 text-sm">Please enter your details</p>
        <h2 className="text-2xl font-bold mb-6">Welcome back</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className={`w-full py-2 text-white font-semibold rounded-lg ${
              loginMutation.isPending
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {loginMutation.isPending ? "Logging in..." : "Login"}
          </button>

            {/* Navigate to Signup */}
        <p className="text-gray-600 text-center mt-4">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-blue-600 font-medium">
            Sign up
          </Link>
        </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
