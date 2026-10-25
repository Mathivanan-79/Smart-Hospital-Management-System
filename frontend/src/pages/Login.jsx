import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle login
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        formData
      );

      const token = response.data;

      login(token);

      navigate("/dashboard");
    } catch (error) {
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Invalid username or password");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden grid md:grid-cols-2">

        {/* Left Side */}
        <div className="hidden md:flex bg-blue-600 text-white p-12 flex-col justify-center">
          <div className="mb-8">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-2xl mb-6">
              🏥
            </div>

            <h1 className="text-4xl font-bold mb-4">
              Smart Hospital
            </h1>

            <p className="text-blue-100 text-lg leading-relaxed">
              A modern hospital management platform designed
              to simplify healthcare operations and improve
              patient care.
            </p>
          </div>

          <div className="space-y-4 text-blue-100">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-white rounded-full"></span>
              Secure healthcare management
            </div>

            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-white rounded-full"></span>
              Appointment management
            </div>

            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-white rounded-full"></span>
              Digital medical records
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="p-8 md:p-12">
          <div className="max-w-md mx-auto">

            {/* Heading */}
            <div className="mb-8">
              <p className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
                Welcome back
              </p>

              <h2 className="text-3xl font-bold text-slate-900 mt-2">
                Sign in to your account
              </h2>

              <p className="text-slate-500 mt-2">
                Enter your credentials to continue.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div
                role="alert"
                className="mb-6 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm"
              >
                {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Username
                </label>

                <input
                  id="username"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  autoComplete="username"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Password
                </label>

                {/* Password Input with Eye Icon */}
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />

                  {/* Show / Hide Password Button */}
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((previous) => !previous)
                    }
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    title={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute inset-y-0 right-0 flex items-center justify-center px-4 text-slate-500 hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-r-xl transition"
                  >
                    {showPassword ? (
                      /* Eye-off Icon */
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M3 3l18 18" />
                        <path d="M10.58 10.58a2 2 0 002.83 2.83" />
                        <path d="M9.88 5.09A10.94 10.94 0 0112 4.9c5 0 9.27 3.11 11 7.1a11.8 11.8 0 01-4.1 5.1" />
                        <path d="M6.61 6.61A11.8 11.8 0 011 12c1.73 3.99 6 7.1 11 7.1a10.9 10.9 0 005.39-1.41" />
                      </svg>
                    ) : (
                      /* Eye Icon */
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition duration-200 shadow-lg shadow-blue-600/20 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* Footer */}
            <p className="text-center text-sm text-slate-400 mt-8">
              Smart Hospital Management System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;