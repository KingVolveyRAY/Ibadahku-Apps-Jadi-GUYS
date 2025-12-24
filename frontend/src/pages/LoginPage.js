import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth, useTheme } from "@/context";
import { PasswordInput, DarkModeToggle } from "@/components/common";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/home");
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gradient-to-b from-green-400 via-green-500 to-green-600"} flex flex-col`}>
      <div className="absolute top-4 right-4">
        <DarkModeToggle />
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4 overflow-hidden">
              <img src="https://customer-assets.emergentagent.com/job_50cfe53e-4256-4482-9821-00551ab1b6e3/artifacts/2nrh84x0_WhatsApp%20Image%202025-12-23%20at%2001.25.53.jpeg" alt="IbadahKu" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-3xl font-bold text-white">IbadahKu</h1>
            <p className={`${darkMode ? "text-gray-400" : "text-green-100"} mt-2`}>Assalamu'alaikum Warahmatullahi Wabarakatuh</p>
          </div>

          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-2xl shadow-xl p-8`}>
            <h2 className={`text-2xl font-semibold ${darkMode ? "text-white" : "text-gray-800"} mb-6`}>Login</h2>
            
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm" data-testid="login-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"} mb-1`}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all ${
                    darkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-200"
                  }`}
                  placeholder="email@example.com"
                  required
                  data-testid="login-email"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"} mb-1`}>Password</label>
                <PasswordInput
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  data-testid="login-password"
                />
              </div>

              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-sm text-green-600 hover:underline">
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50"
                data-testid="login-submit"
              >
                {loading ? "Loading..." : "Login"}
              </button>
            </form>

            <p className={`text-center mt-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              Don't have an account?{" "}
              <Link to="/register" className="text-green-600 font-semibold hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Wave decoration */}
      {!darkMode && (
        <div className="relative h-32">
          <svg viewBox="0 0 1440 120" className="absolute bottom-0 w-full h-full">
            <path fill="#f0fdf4" d="M0,64L60,69.3C120,75,240,85,360,80C480,75,600,53,720,48C840,43,960,53,1080,58.7C1200,64,1320,64,1380,64L1440,64L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z"></path>
          </svg>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
