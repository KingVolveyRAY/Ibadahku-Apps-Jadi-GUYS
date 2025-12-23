import { useState, useEffect, createContext, useContext } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Theme Context for Dark Mode
const ThemeContext = createContext(null);

export const useTheme = () => useContext(ThemeContext);

const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Password Input Component with Toggle Visibility
const PasswordInput = ({ value, onChange, placeholder = "••••••••", className = "", ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const { darkMode } = useTheme();

  return (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all ${
          darkMode 
            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
            : "border-gray-200 bg-white text-gray-800"
        } ${className}`}
        placeholder={placeholder}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors ${
          darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"
        }`}
      >
        {showPassword ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        )}
      </button>
    </div>
  );
};

// Dark Mode Toggle Button
const DarkModeToggle = ({ className = "" }) => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <button
      onClick={toggleDarkMode}
      className={`p-2 rounded-lg transition-colors ${
        darkMode 
          ? "bg-gray-700 text-yellow-400 hover:bg-gray-600" 
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      } ${className}`}
      data-testid="dark-mode-toggle"
      title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {darkMode ? (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  );
};

// Auth Context
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API}/user/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (e) {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await axios.post(`${API}/auth/login`, { email, password });
    localStorage.setItem("token", response.data.access_token);
    setToken(response.data.access_token);
    setUser(response.data.user);
    return response.data;
  };

  const register = async (email, password, full_name) => {
    const response = await axios.post(`${API}/auth/register`, { email, password, full_name });
    localStorage.setItem("token", response.data.access_token);
    setToken(response.data.access_token);
    setUser(response.data.user);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected Route
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const { darkMode } = useTheme();
  
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-gray-900" : "bg-gradient-to-b from-green-100 to-green-200"}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Header Component
const Header = () => {
  const { user, logout } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navItems = [
    { path: "/home", label: "Home", icon: "🏠" },
    { path: "/prayer", label: "Prayer", icon: "🕌" },
    { path: "/calendar", label: "Calendar", icon: "📅" },
  ];

  return (
    <header className={`${darkMode ? "bg-gray-800" : "bg-gradient-to-r from-green-600 to-green-500"} text-white shadow-lg sticky top-0 z-50`}>
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
            <img src="https://customer-assets.emergentagent.com/job_50cfe53e-4256-4482-9821-00551ab1b6e3/artifacts/2nrh84x0_WhatsApp%20Image%202025-12-23%20at%2001.25.53.jpeg" alt="IbadahKu" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-xl">IbadahKu</span>
        </div>

        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                location.pathname === item.path
                  ? "bg-white/20 font-semibold"
                  : "hover:bg-white/10"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-2">
          <DarkModeToggle className="mr-2" />
          
          <button
            onClick={() => navigate("/add-amal")}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            data-testid="add-amal-btn"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
              data-testid="user-dropdown-btn"
            >
              <div className={`w-8 h-8 ${darkMode ? "bg-green-600" : "bg-green-300"} rounded-full flex items-center justify-center ${darkMode ? "text-white" : "text-green-800"} font-semibold`}>
                {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <span className="hidden sm:block">{user?.full_name?.split(" ")[0] || "User"}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className={`absolute right-0 mt-2 w-48 ${darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-700"} rounded-lg shadow-lg py-2`}>
                <Link
                  to="/profile"
                  className={`block px-4 py-2 ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                  onClick={() => setDropdownOpen(false)}
                  data-testid="profile-link"
                >
                  👤 Profile
                </Link>
                <Link
                  to="/tracker"
                  className={`block px-4 py-2 ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                  onClick={() => setDropdownOpen(false)}
                  data-testid="tracker-link"
                >
                  📊 Tracker
                </Link>
                <hr className={`my-2 ${darkMode ? "border-gray-700" : ""}`} />
                <button
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                  className={`block w-full text-left px-4 py-2 ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"} text-red-500`}
                  data-testid="logout-btn"
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <nav className={`md:hidden flex justify-around py-2 border-t ${darkMode ? "border-gray-700" : "border-white/20"}`}>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center px-4 py-1 rounded-lg ${
              location.pathname === item.path ? "text-yellow-300" : ""
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </nav>
    </header>
  );
};

// Login Page
const LoginPage = () => {
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

// Register Page
const RegisterPage = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register, user } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/home");
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await register(email, password, fullName);
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gradient-to-b from-green-50 to-white"} flex items-center justify-center p-4`}>
      <div className="absolute top-4 right-4">
        <DarkModeToggle />
      </div>
      
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>Create an Account</h1>
        </div>

        <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-2xl shadow-xl p-8`}>
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm" data-testid="register-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"} mb-1`}>Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none ${
                  darkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-200"
                }`}
                placeholder="Enter your full name"
                required
                data-testid="register-fullname"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"} mb-1`}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none ${
                  darkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-200"
                }`}
                placeholder="email@example.com"
                required
                data-testid="register-email"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"} mb-1`}>Password</label>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="register-password"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"} mb-1`}>Confirm Password</label>
              <PasswordInput
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                data-testid="register-confirm-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50"
              data-testid="register-submit"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className={`text-center mt-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            Already have an account?{" "}
            <Link to="/login" className="text-green-600 font-semibold hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// Forgot Password Page
const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/forgot-password`, { email });
      
      if (response.data.email_sent) {
        setSuccess("Kode reset telah dikirim ke email Anda! Cek inbox atau folder spam.");
      } else if (response.data.code) {
        // Fallback when email fails (for testing/development)
        setSuccess(`Email gagal terkirim. Kode reset Anda: ${response.data.code}`);
        setCode(response.data.code);
      } else {
        setSuccess(response.data.message);
      }
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.detail || "Gagal mengirim kode reset");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Password tidak cocok");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/auth/reset-password`, {
        email,
        code,
        new_password: newPassword
      });
      setSuccess("Password berhasil direset!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || "Gagal reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gradient-to-b from-green-50 to-white"} flex items-center justify-center p-4`}>
      <div className="absolute top-4 right-4">
        <DarkModeToggle />
      </div>
      
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>Lupa Password?</h1>
          <p className={`${darkMode ? "text-gray-400" : "text-gray-500"} mt-2`}>
            {step === 1 ? "Masukkan email untuk reset password" : "Masukkan kode verifikasi"}
          </p>
        </div>

        <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-2xl shadow-xl p-8`}>
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm">{error}</div>
          )}
          {success && (
            <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm">{success}</div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"} mb-1`}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none ${
                    darkMode 
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                      : "bg-white border-gray-200 text-gray-800"
                  }`}
                  placeholder="email@example.com"
                  required
                  data-testid="forgot-email"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50"
                data-testid="forgot-submit"
              >
                {loading ? "Mengirim..." : "Kirim Kode Reset"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"} mb-1`}>Kode Verifikasi</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-center text-2xl tracking-widest ${
                    darkMode 
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                      : "bg-white border-gray-200 text-gray-800"
                  }`}
                  placeholder="XXXXXX"
                  maxLength={6}
                  required
                  data-testid="forgot-code"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"} mb-1`}>Password Baru</label>
                <PasswordInput
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  data-testid="forgot-new-password"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"} mb-1`}>Konfirmasi Password Baru</label>
                <PasswordInput
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  data-testid="forgot-confirm-password"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50"
                data-testid="forgot-reset-submit"
              >
                {loading ? "Mereset..." : "Reset Password"}
              </button>
            </form>
          )}

          <p className="text-center mt-6">
            <Link to="/login" className="text-green-600 font-semibold hover:underline">
              ← Kembali ke Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// Home Page
const HomePage = () => {
  const { user, token } = useAuth();
  const { darkMode } = useTheme();
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [hijriDate, setHijriDate] = useState(null);
  const [dailyAmals, setDailyAmals] = useState([]);
  const [prayerStats, setPrayerStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prayerRes, statsRes, amalsRes] = await Promise.all([
        axios.get(`${API}/prayer-times`),
        axios.get(`${API}/prayer-track/stats/weekly`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: null })),
        axios.get(`${API}/amal?date=${new Date().toISOString().split('T')[0]}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] }))
      ]);

      setPrayerTimes(prayerRes.data);
      setHijriDate(prayerRes.data.date?.hijri);
      setPrayerStats(statsRes.data);
      setDailyAmals(amalsRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  const getCurrentPrayer = () => {
    if (!prayerTimes) return null;
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const timings = prayerTimes.timings;
    
    const prayers = [
      { name: "Subuh", time: timings.Subuh },
      { name: "Dzuhur", time: timings.Dzuhur },
      { name: "Ashar", time: timings.Ashar },
      { name: "Maghrib", time: timings.Maghrib },
      { name: "Isya", time: timings.Isya }
    ];

    for (let i = prayers.length - 1; i >= 0; i--) {
      const [h, m] = prayers[i].time.split(":").map(Number);
      if (currentTime >= h * 60 + m) {
        return prayers[i];
      }
    }
    return prayers[prayers.length - 1];
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  const currentPrayer = getCurrentPrayer();

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`} data-testid="home-page">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Greeting Card */}
        <div className={`${darkMode ? "bg-gradient-to-r from-green-700 to-green-600" : "bg-gradient-to-r from-green-500 to-green-400"} rounded-2xl p-6 text-white mb-6 shadow-lg`}>
          <p className="text-green-100">Assalamu'alaikum,</p>
          <h1 className="text-2xl font-bold mb-2">{user?.full_name}</h1>
          <p className="text-green-100 text-sm">{getGreeting()}</p>
          
          {hijriDate && (
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-sm text-green-100">
                {hijriDate.day} {hijriDate.month.en} {hijriDate.year} H
              </p>
            </div>
          )}
        </div>

        {/* Current Prayer */}
        {currentPrayer && (
          <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-green-100"} rounded-xl p-4 mb-6 shadow-sm border`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Waktu Shalat Sekarang</p>
                <h3 className="text-xl font-bold text-green-600">{currentPrayer.name}</h3>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>{currentPrayer.time}</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div
            className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} rounded-xl p-4 shadow-sm border cursor-pointer hover:shadow-md transition-shadow`}
            onClick={() => navigate("/prayer")}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🕌</span>
              <span className="text-green-500 text-sm font-medium">
                {prayerStats?.percentage || 0}%
              </span>
            </div>
            <p className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-sm`}>Shalat Minggu Ini</p>
            <p className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
              {prayerStats?.completed || 0}/{prayerStats?.total || 35}
            </p>
          </div>

          <div
            className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} rounded-xl p-4 shadow-sm border cursor-pointer hover:shadow-md transition-shadow`}
            onClick={() => navigate("/tracker")}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">📋</span>
              <span className="text-green-500 text-sm font-medium">
                {dailyAmals.filter(a => a.completed).length}/{dailyAmals.length}
              </span>
            </div>
            <p className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-sm`}>Amal Hari Ini</p>
            <p className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
              {dailyAmals.filter(a => a.completed).length} selesai
            </p>
          </div>
        </div>

        {/* Daily Reminders */}
        <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} rounded-xl p-4 shadow-sm border`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>Daily Reminders/Amal</h3>
            <button
              onClick={() => navigate("/add-amal")}
              className="text-green-500 text-sm font-medium hover:underline"
            >
              + Tambah
            </button>
          </div>

          {dailyAmals.length === 0 ? (
            <div className={`text-center py-8 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
              <p className="text-4xl mb-2">📝</p>
              <p>Belum ada amal hari ini</p>
              <button
                onClick={() => navigate("/add-amal")}
                className="mt-2 text-green-500 font-medium hover:underline"
              >
                Tambah Amal
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {dailyAmals.slice(0, 5).map((amal) => (
                <div
                  key={amal.id}
                  className={`flex items-center p-3 rounded-lg ${
                    amal.completed 
                      ? darkMode ? "bg-green-900/30" : "bg-green-50" 
                      : darkMode ? "bg-gray-700" : "bg-gray-50"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                      amal.completed
                        ? "bg-green-500 border-green-500"
                        : darkMode ? "border-gray-500" : "border-gray-300"
                    }`}
                  >
                    {amal.completed && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className={amal.completed ? "line-through text-gray-400" : darkMode ? "text-gray-200" : "text-gray-700"}>
                    {amal.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// Export remaining components
export { LoginPage, RegisterPage, ForgotPasswordPage, HomePage, Header, AuthProvider, ProtectedRoute, ThemeProvider };

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/prayer" element={<ProtectedRoute><PrayerPage /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/tracker" element={<ProtectedRoute><TrackerPage /></ProtectedRoute>} />
            <Route path="/add-amal" element={<ProtectedRoute><AddAmalPage /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

// Prayer Page
const PrayerPage = () => {
  const { token } = useAuth();
  const { darkMode } = useTheme();
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [prayerTrack, setPrayerTrack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Use local date format
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  useEffect(() => {
    fetchData();
    // Update current time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [timesRes, trackRes] = await Promise.all([
        axios.get(`${API}/prayer-times`),
        axios.get(`${API}/prayer-track/${today}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: null }))
      ]);
      setPrayerTimes(timesRes.data);
      setPrayerTrack(trackRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Check if prayer time has passed
  const isPrayerTimePassed = (prayerTime) => {
    if (!prayerTime) return false;
    const [hours, minutes] = prayerTime.split(':').map(Number);
    const prayerMinutes = hours * 60 + minutes;
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    return currentMinutes >= prayerMinutes;
  };

  const togglePrayer = async (prayerName, prayerTime) => {
    // Check if prayer time has passed
    if (!isPrayerTimePassed(prayerTime)) {
      return; // Don't allow checking if time hasn't passed
    }
    
    const prayerKey = prayerName.toLowerCase();
    const currentValue = prayerTrack?.[prayerKey] || false;
    
    try {
      const response = await axios.post(
        `${API}/prayer-track`,
        {
          date: today,
          subuh: prayerKey === "subuh" ? !currentValue : (prayerTrack?.subuh || false),
          dzuhur: prayerKey === "dzuhur" ? !currentValue : (prayerTrack?.dzuhur || false),
          ashar: prayerKey === "ashar" ? !currentValue : (prayerTrack?.ashar || false),
          maghrib: prayerKey === "maghrib" ? !currentValue : (prayerTrack?.maghrib || false),
          isya: prayerKey === "isya" ? !currentValue : (prayerTrack?.isya || false)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPrayerTrack(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  const prayers = [
    { key: "subuh", name: "Subuh", time: prayerTimes?.timings?.Subuh, icon: "🌅" },
    { key: "dzuhur", name: "Dzuhur", time: prayerTimes?.timings?.Dzuhur, icon: "☀️" },
    { key: "ashar", name: "Ashar", time: prayerTimes?.timings?.Ashar, icon: "🌤️" },
    { key: "maghrib", name: "Maghrib", time: prayerTimes?.timings?.Maghrib, icon: "🌅" },
    { key: "isya", name: "Isya", time: prayerTimes?.timings?.Isya, icon: "🌙" }
  ];

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`} data-testid="prayer-page">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Date Header */}
        <div className={`${darkMode ? "bg-gradient-to-r from-green-700 to-green-600" : "bg-gradient-to-r from-green-500 to-green-400"} rounded-2xl p-6 text-white mb-6 shadow-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Today</p>
              <h2 className="text-xl font-bold">
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h2>
              {prayerTimes?.date?.hijri && (
                <p className="text-green-100 text-sm mt-1">
                  {prayerTimes.date.hijri.day} {prayerTimes.date.hijri.month.en} {prayerTimes.date.hijri.year} H
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-3xl">🕌</span>
              </div>
            </div>
          </div>
        </div>

        {/* Prayer Times List */}
        <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} rounded-xl shadow-sm border overflow-hidden`}>
          <div className={`p-4 border-b ${darkMode ? "border-gray-700" : "border-gray-100"}`}>
            <h3 className={`font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>Jadwal Shalat Hari Ini</h3>
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Tap untuk menandai sudah shalat (hanya bisa setelah waktu shalat tiba)</p>
          </div>
          
          <div className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-100"}`}>
            {prayers.map((prayer) => {
              const timePassed = isPrayerTimePassed(prayer.time);
              const isCompleted = prayerTrack?.[prayer.key];
              
              return (
                <div
                  key={prayer.key}
                  className={`flex items-center justify-between p-4 transition-colors ${
                    !timePassed 
                      ? darkMode ? "bg-gray-800/50 opacity-60" : "bg-gray-50/50 opacity-60"
                      : isCompleted 
                        ? darkMode ? "bg-green-900/30 cursor-pointer" : "bg-green-50 cursor-pointer" 
                        : darkMode ? "hover:bg-gray-700 cursor-pointer" : "hover:bg-gray-50 cursor-pointer"
                  }`}
                  onClick={() => togglePrayer(prayer.key, prayer.time)}
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl">{prayer.icon}</span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className={`font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>{prayer.name}</p>
                        {!timePassed && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? "bg-yellow-900/50 text-yellow-400" : "bg-yellow-100 text-yellow-700"}`}>
                            Belum waktunya
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{prayer.time}</p>
                    </div>
                  </div>
                  <div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                      isCompleted
                        ? "bg-green-500 border-green-500"
                        : !timePassed
                          ? darkMode ? "border-gray-600 bg-gray-700" : "border-gray-200 bg-gray-100"
                          : darkMode ? "border-gray-500" : "border-gray-300"
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : !timePassed ? (
                      <svg className={`w-4 h-4 ${darkMode ? "text-gray-500" : "text-gray-400"}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    ) : null}
                  </div>
                </div>
              );
            })}
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                    prayerTrack?.[prayer.key]
                      ? "bg-green-500 border-green-500"
                      : darkMode ? "border-gray-500" : "border-gray-300"
                  }`}
                >
                  {prayerTrack?.[prayer.key] && (
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sunrise Time */}
        <div className={`mt-4 ${darkMode ? "bg-yellow-900/30 border-yellow-800" : "bg-yellow-50 border-yellow-100"} rounded-xl p-4 border`}>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🌅</span>
            <div>
              <p className={`font-medium ${darkMode ? "text-yellow-300" : "text-yellow-800"}`}>Terbit</p>
              <p className={`text-sm ${darkMode ? "text-yellow-400" : "text-yellow-600"}`}>{prayerTimes?.timings?.Terbit}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Calendar Page
const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [hijriInfo, setHijriInfo] = useState(null);
  const [dailyAmals, setDailyAmals] = useState([]);
  const [allAmals, setAllAmals] = useState([]);
  const { token } = useAuth();
  const { darkMode } = useTheme();

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  useEffect(() => {
    fetchHijriDate();
    fetchDailyAmals();
  }, [selectedDate]);

  useEffect(() => {
    fetchAllAmals();
  }, [currentDate]);

  const fetchHijriDate = async () => {
    try {
      const dateStr = `${selectedDate.getDate().toString().padStart(2, '0')}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getFullYear()}`;
      const response = await axios.get(`${API}/hijri/convert?date=${dateStr}`);
      setHijriInfo(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDailyAmals = async () => {
    try {
      // Use local date format to avoid timezone issues
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const response = await axios.get(`${API}/amal?date=${dateStr}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDailyAmals(response.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllAmals = async () => {
    try {
      const response = await axios.get(`${API}/amal`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllAmals(response.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    // Add empty days for alignment
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    // Add days of month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    if (!date) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const hasAmal = (date) => {
    if (!date) return false;
    // Use local date format to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return allAmals.some(amal => amal.scheduled_date === dateStr);
  };

  const getAmalsForDate = (date) => {
    if (!date) return [];
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return allAmals.filter(amal => amal.scheduled_date === dateStr);
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`} data-testid="calendar-page">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Month Header */}
        <div className={`${darkMode ? "bg-gradient-to-r from-green-700 to-green-600" : "bg-gradient-to-r from-green-500 to-green-400"} rounded-2xl p-4 text-white mb-6 shadow-lg`}>
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="text-center">
              <h2 className="text-xl font-bold">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              {hijriInfo && (
                <p className="text-green-100 text-sm mt-1">
                  {hijriInfo.month.en} {hijriInfo.year} H
                </p>
              )}
            </div>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <div className={`md:col-span-2 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} rounded-xl shadow-sm border p-4`}>
            {/* Day Names */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((day) => (
                <div key={day} className={`text-center text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"} py-2`}>
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((date, index) => (
                <button
                  key={index}
                  onClick={() => date && setSelectedDate(date)}
                  disabled={!date}
                  className={`aspect-square p-2 rounded-lg text-sm transition-all relative ${
                    !date
                      ? "invisible"
                      : isSelected(date)
                      ? "bg-green-500 text-white font-bold"
                      : isToday(date)
                      ? darkMode ? "bg-green-900/50 text-green-300 font-semibold" : "bg-green-100 text-green-700 font-semibold"
                      : darkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  {date?.getDate()}
                  {hasAmal(date) && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Date Info */}
          <div className="space-y-4">
            <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} rounded-xl shadow-sm border p-4`}>
              <h3 className={`font-semibold ${darkMode ? "text-white" : "text-gray-800"} mb-3`}>Tanggal Terpilih</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">📅</span>
                  <span className={darkMode ? "text-gray-300" : "text-gray-700"}>
                    {selectedDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                {hijriInfo && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">🌙</span>
                    <span className={darkMode ? "text-gray-300" : "text-gray-700"}>
                      {hijriInfo.day} {hijriInfo.month.en} {hijriInfo.year} H
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Daily Amal/Events */}
            <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} rounded-xl shadow-sm border p-4`}>
              <h3 className={`font-semibold ${darkMode ? "text-white" : "text-gray-800"} mb-3`}>Amal Hari Ini</h3>
              {dailyAmals.length > 0 ? (
                <div className="space-y-2">
                  {dailyAmals.map((amal) => (
                    <div key={amal.id} className={`flex items-center space-x-2 p-2 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                      <span className={`w-2 h-2 rounded-full ${amal.completed ? "bg-green-500" : "bg-yellow-500"}`}></span>
                      <span className={`text-sm ${amal.completed ? "line-through text-gray-400" : darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        {amal.name}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`text-center py-4 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                  <span className="text-2xl">📝</span>
                  <p className="mt-2 text-sm">Tidak ada amal</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Profile Page
const ProfilePage = () => {
  const { user, token, updateUser, logout } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    city: user?.city || "",
    country: user?.country || "Indonesia"
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await axios.put(`${API}/user/me`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      updateUser(response.data);
      setEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`} data-testid="profile-page">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Profile Header */}
        <div className={`${darkMode ? "bg-gradient-to-r from-green-700 to-green-600" : "bg-gradient-to-r from-green-500 to-green-400"} rounded-2xl p-6 text-white mb-6 shadow-lg`}>
          <div className="flex items-center space-x-4">
            <div className={`w-20 h-20 ${darkMode ? "bg-gray-700" : "bg-white"} rounded-full flex items-center justify-center ${darkMode ? "text-green-400" : "text-green-500"} text-3xl font-bold`}>
              {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user?.full_name}</h2>
              <p className="text-green-100">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} rounded-xl shadow-sm border p-6`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`font-semibold ${darkMode ? "text-white" : "text-gray-800"} text-lg`}>Account Information</h3>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                data-testid="edit-profile-btn"
              >
                Edit Profile
              </button>
            ) : (
              <div className="space-x-2">
                <button
                  onClick={() => setEditing(false)}
                  className={`px-4 py-2 border ${darkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-600 hover:bg-gray-50"} rounded-lg transition-colors`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                  data-testid="save-profile-btn"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"} mb-1`}>Full Name</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-200"}`}
                  data-testid="profile-fullname"
                />
              ) : (
                <p className={`px-4 py-3 ${darkMode ? "bg-gray-700 text-gray-200" : "bg-gray-50 text-gray-700"} rounded-lg`}>{user?.full_name}</p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"} mb-1`}>Email</label>
              <p className={`px-4 py-3 ${darkMode ? "bg-gray-700 text-gray-400" : "bg-gray-50 text-gray-500"} rounded-lg`}>{user?.email}</p>
            </div>

            <div>
              <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"} mb-1`}>Phone</label>
              {editing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-200"}`}
                  placeholder="+62 xxx xxxx xxxx"
                  data-testid="profile-phone"
                />
              ) : (
                <p className={`px-4 py-3 ${darkMode ? "bg-gray-700 text-gray-200" : "bg-gray-50 text-gray-700"} rounded-lg`}>{user?.phone || "-"}</p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"} mb-1`}>Address</label>
              {editing ? (
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-200"}`}
                  rows={2}
                  placeholder="Your address"
                  data-testid="profile-address"
                />
              ) : (
                <p className={`px-4 py-3 ${darkMode ? "bg-gray-700 text-gray-200" : "bg-gray-50 text-gray-700"} rounded-lg`}>{user?.address || "-"}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"} mb-1`}>City</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-200"}`}
                    placeholder="Jakarta"
                    data-testid="profile-city"
                  />
                ) : (
                  <p className={`px-4 py-3 ${darkMode ? "bg-gray-700 text-gray-200" : "bg-gray-50 text-gray-700"} rounded-lg`}>{user?.city || "-"}</p>
                )}
              </div>
              <div>
                <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"} mb-1`}>Country</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-200"}`}
                    placeholder="Indonesia"
                    data-testid="profile-country"
                  />
                ) : (
                  <p className={`px-4 py-3 ${darkMode ? "bg-gray-700 text-gray-200" : "bg-gray-50 text-gray-700"} rounded-lg`}>{user?.country || "Indonesia"}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className={`w-full mt-6 py-3 border-2 border-red-500 text-red-500 rounded-xl font-semibold ${darkMode ? "hover:bg-red-900/30" : "hover:bg-red-50"} transition-colors`}
          data-testid="logout-profile-btn"
        >
          Logout
        </button>
      </main>
    </div>
  );
};

// Tracker Page
const TrackerPage = () => {
  const { token } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [prayerTrack, setPrayerTrack] = useState(null);
  const [amals, setAmals] = useState([]);
  const [dailyNote, setDailyNote] = useState(null);
  const [prayerStats, setPrayerStats] = useState(null);
  const [notes, setNotes] = useState("");
  const [reflections, setReflections] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Use local date format to avoid timezone issues
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // Islamic inspirational quotes for reflections
  const islamicQuotes = [
    "\"Sesungguhnya sesudah kesulitan itu ada kemudahan.\" - QS. Al-Insyirah: 6",
    "\"Dan bersabarlah, sesungguhnya Allah beserta orang-orang yang sabar.\" - QS. Al-Anfal: 46",
    "\"Barangsiapa bertakwa kepada Allah, niscaya Dia akan membukakan jalan keluar baginya.\" - QS. At-Talaq: 2",
    "\"Sesungguhnya Allah tidak akan mengubah keadaan suatu kaum sebelum mereka mengubah keadaan diri mereka sendiri.\" - QS. Ar-Ra'd: 11",
    "\"Dan mohonlah pertolongan dengan sabar dan shalat.\" - QS. Al-Baqarah: 45",
    "\"Maka ingatlah kepada-Ku, Aku pun akan ingat kepadamu.\" - QS. Al-Baqarah: 152",
    "\"Cukuplah Allah bagiku, tidak ada Tuhan selain Dia.\" - QS. At-Taubah: 129",
    "\"Sesungguhnya bersama kesulitan ada kemudahan.\" - QS. Al-Insyirah: 5",
    "\"Dan Tuhanmu berfirman: Berdoalah kepada-Ku, niscaya akan Aku perkenankan bagimu.\" - QS. Ghafir: 60",
    "\"Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia lainnya.\" - HR. Ahmad",
    "\"Senyummu di hadapan saudaramu adalah sedekah.\" - HR. Tirmidzi",
    "\"Kebersihan adalah sebagian dari iman.\" - HR. Muslim",
    "\"Orang mukmin yang kuat lebih baik dan lebih dicintai Allah daripada orang mukmin yang lemah.\" - HR. Muslim",
    "\"Barangsiapa yang menempuh jalan untuk mencari ilmu, maka Allah mudahkan baginya jalan menuju surga.\" - HR. Muslim"
  ];

  const getRandomQuote = () => {
    const index = Math.floor(Math.random() * islamicQuotes.length);
    return islamicQuotes[index];
  };

  const [dailyQuote] = useState(getRandomQuote());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [timesRes, trackRes, amalsRes, noteRes, statsRes] = await Promise.all([
        axios.get(`${API}/prayer-times`),
        axios.get(`${API}/prayer-track/${today}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: null })),
        axios.get(`${API}/amal?date=${today}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] })),
        axios.get(`${API}/daily-notes/${today}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: null })),
        axios.get(`${API}/prayer-track/stats/weekly`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: null }))
      ]);

      setPrayerTimes(timesRes.data);
      setPrayerTrack(trackRes.data);
      setAmals(amalsRes.data || []);
      setDailyNote(noteRes.data);
      setPrayerStats(statsRes.data);
      setNotes(noteRes.data?.notes || "");
      setReflections(noteRes.data?.reflections || "");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAmal = async (amalId, completed) => {
    try {
      const response = await axios.put(
        `${API}/amal/${amalId}`,
        { completed: !completed },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAmals(amals.map(a => a.id === amalId ? response.data : a));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteAmal = async (amalId) => {
    try {
      await axios.delete(`${API}/amal/${amalId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAmals(amals.filter(a => a.id !== amalId));
    } catch (err) {
      console.error(err);
    }
  };

  const saveNotes = async () => {
    try {
      await axios.post(
        `${API}/daily-notes`,
        { date: today, notes, reflections },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  const completedPrayers = prayerTrack
    ? [prayerTrack.subuh, prayerTrack.dzuhur, prayerTrack.ashar, prayerTrack.maghrib, prayerTrack.isya].filter(Boolean).length
    : 0;

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`} data-testid="tracker-page">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Date Header */}
        <div className={`${darkMode ? "bg-gradient-to-r from-green-700 to-green-600" : "bg-gradient-to-r from-green-500 to-green-400"} rounded-2xl p-6 text-white mb-6 shadow-lg`}>
          <p className="text-green-100 text-sm">Today, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}</p>
          <h2 className="text-xl font-bold">
            {prayerTimes?.date?.hijri?.day} {prayerTimes?.date?.hijri?.month?.en} {prayerTimes?.date?.hijri?.year} H
          </h2>
        </div>

        {/* Prayer Summary */}
        <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} rounded-xl shadow-sm border p-4 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>Prayer Summary</h3>
            <span className="text-green-500 font-medium">{completedPrayers}/5</span>
          </div>
          <div className="flex justify-around">
            {["Subuh", "Dzuhur", "Ashar", "Maghrib", "Isya"].map((prayer) => {
              const key = prayer.toLowerCase();
              const completed = prayerTrack?.[key];
              return (
                <div key={prayer} className="text-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${
                      completed ? "bg-green-500 text-white" : darkMode ? "bg-gray-700 text-gray-500" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {completed ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span className="text-xs">○</span>
                    )}
                  </div>
                  <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{prayer}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Amal Hari Ini */}
          <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} rounded-xl shadow-sm border p-4`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>Amal Hari Ini</h3>
              <button
                onClick={() => navigate("/add-amal")}
                className="text-green-500 text-sm font-medium hover:underline"
              >
                + Tambah
              </button>
            </div>
            {amals.length > 0 ? (
              <div className="space-y-2 mb-4">
                {amals.map((amal) => (
                  <div
                    key={amal.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      amal.completed 
                        ? darkMode ? "bg-green-900/30" : "bg-green-50" 
                        : darkMode ? "bg-gray-700" : "bg-gray-50"
                    }`}
                  >
                    <div 
                      className="flex items-center space-x-3 flex-1 cursor-pointer"
                      onClick={() => toggleAmal(amal.id, amal.completed)}
                    >
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          amal.completed ? "bg-green-500 border-green-500" : darkMode ? "border-gray-500" : "border-gray-300"
                        }`}
                      >
                        {amal.completed && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <span className={amal.completed ? "line-through text-gray-400" : darkMode ? "text-gray-200" : "text-gray-700"}>
                          {amal.name}
                        </span>
                        {amal.scheduled_time && (
                          <span className={`ml-2 text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                            ⏰ {amal.scheduled_time}
                          </span>
                        )}
                        {amal.notes && (
                          <p className={`text-xs mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                            {amal.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteAmal(amal.id)}
                      className={`p-1 rounded hover:bg-red-100 ${darkMode ? "text-red-400 hover:bg-red-900/30" : "text-red-500"}`}
                      title="Hapus amal"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-center py-6 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                <span className="text-3xl">📝</span>
                <p className="mt-2 text-sm">Belum ada amal hari ini</p>
                <button
                  onClick={() => navigate("/add-amal")}
                  className="mt-2 text-green-500 text-sm font-medium hover:underline"
                >
                  Tambah Amal
                </button>
              </div>
            )}
            
            {/* Catatan Pribadi */}
            <div className={`mt-4 pt-4 border-t ${darkMode ? "border-gray-700" : "border-gray-100"}`}>
              <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"} mb-2`}>
                📝 Catatan Pribadi
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={saveNotes}
                placeholder="Tulis catatan harianmu di sini..."
                className={`w-full px-3 py-2 border rounded-lg text-sm resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none ${
                  darkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-200"
                }`}
                rows={3}
              />
            </div>
          </div>

          {/* Stats & Completion */}
          <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} rounded-xl shadow-sm border p-4`}>
            <h3 className={`font-semibold ${darkMode ? "text-white" : "text-gray-800"} mb-3`}>Status & Completion</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${darkMode ? "bg-orange-900/50" : "bg-orange-100"} rounded-full flex items-center justify-center`}>
                  <span className="text-orange-500">🔥</span>
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Prayer Streak</p>
                  <p className={`font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>{prayerStats?.completed || 0} prayers</p>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Weekly Completion</span>
                  <span className="text-green-500 font-medium">{prayerStats?.percentage || 0}%</span>
                </div>
                <div className={`w-full ${darkMode ? "bg-gray-700" : "bg-gray-200"} rounded-full h-2`}>
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${prayerStats?.percentage || 0}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Daily Amal</span>
                  <span className="text-green-500 font-medium">
                    {amals.filter(a => a.completed).length}/{amals.length}
                  </span>
                </div>
                <div className={`w-full ${darkMode ? "bg-gray-700" : "bg-gray-200"} rounded-full h-2`}>
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${amals.length > 0 ? (amals.filter(a => a.completed).length / amals.length * 100) : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reflections - Kata Penyejuk */}
        <div className={`mt-6 ${darkMode ? "bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-green-800" : "bg-gradient-to-r from-green-50 to-emerald-50 border-green-100"} rounded-xl shadow-sm border p-4`}>
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-xl">🌿</span>
            <h3 className={`font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>Kata Penyejuk Hari Ini</h3>
          </div>
          
          {/* Auto Generated Quote */}
          <div className={`p-4 rounded-lg mb-4 ${darkMode ? "bg-gray-800/50" : "bg-white"}`}>
            <p className={`text-sm italic ${darkMode ? "text-green-300" : "text-green-700"}`}>
              {dailyQuote}
            </p>
          </div>
          
          {/* Personal Reflection */}
          <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"} mb-2`}>
            Refleksi Pribadimu:
          </label>
          <textarea
            value={reflections}
            onChange={(e) => setReflections(e.target.value)}
            onBlur={saveNotes}
            placeholder="Apa yang kamu syukuri hari ini? Apa yang ingin kamu perbaiki?"
            className={`w-full px-3 py-2 border rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none ${
              darkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-200 bg-white"
            }`}
            rows={3}
          />
        </div>
      </main>
    </div>
  );
};

// Add Amal Page
const AddAmalPage = () => {
  const { token } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  
  // Use local date format to avoid timezone issues
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const [scheduledDate, setScheduledDate] = useState(todayStr);
  const [scheduledTime, setScheduledTime] = useState("");
  const [repeatDaily, setRepeatDaily] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await axios.post(
        `${API}/amal`,
        {
          name,
          notes,
          scheduled_date: scheduledDate,
          scheduled_time: scheduledTime || null,
          repeat_daily: repeatDaily
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Amal created:", response.data);
      navigate("/home");
    } catch (err) {
      console.error("Error creating amal:", err);
      setError(err.response?.data?.detail || "Failed to create amal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`} data-testid="add-amal-page">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} rounded-xl shadow-sm border p-6`}>
          <h2 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-800"} mb-6`}>Add New Amal</h2>
          
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"} mb-1`}>Amal Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none ${
                  darkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-200"
                }`}
                placeholder="e.g., Baca Dzikir Pagi"
                required
                data-testid="amal-name"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"} mb-1`}>Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none ${
                  darkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-200"
                }`}
                rows={3}
                placeholder="Additional notes..."
                data-testid="amal-notes"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"} mb-2`}>Set Date and Time</label>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <div className={`flex items-center space-x-2 px-4 py-3 border rounded-lg ${
                    darkMode ? "bg-gray-700 border-gray-600" : "border-gray-200"
                  }`}>
                    <span>📅</span>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className={`flex-1 outline-none bg-transparent ${darkMode ? "text-white" : ""}`}
                      data-testid="amal-date"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className={`flex items-center space-x-2 px-4 py-3 border rounded-lg ${
                    darkMode ? "bg-gray-700 border-gray-600" : "border-gray-200"
                  }`}>
                    <span>⏰</span>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className={`flex-1 outline-none bg-transparent ${darkMode ? "text-white" : ""}`}
                      data-testid="amal-time"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 py-2">
              <button
                type="button"
                onClick={() => setRepeatDaily(!repeatDaily)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  repeatDaily ? "bg-green-500" : darkMode ? "bg-gray-600" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    repeatDaily ? "translate-x-6" : "translate-x-0.5"
                  }`}
                ></div>
              </button>
              <span className={darkMode ? "text-gray-300" : "text-gray-700"}>Repeat Daily</span>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={loading || !name}
                className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50"
                data-testid="amal-submit"
              >
                {loading ? "Saving..." : "Add"}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className={`flex-1 border py-3 rounded-lg font-semibold transition-colors ${
                  darkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default App;
