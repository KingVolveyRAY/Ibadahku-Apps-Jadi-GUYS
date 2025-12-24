import { useState } from "react";
import { Link, useNavigate, useLocation as useRouterLocation } from "react-router-dom";
import { useAuth, useTheme, useLocation } from "@/context";
import { DarkModeToggle } from "./DarkModeToggle";

export const Header = () => {
  const { user, logout } = useAuth();
  const { darkMode } = useTheme();
  const { location: userLocation, permissionStatus, refreshLocation } = useLocation();
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navItems = [
    { path: "/home", label: "Home", icon: "🏠" },
    { path: "/prayer", label: "Shalat", icon: "🕌" },
    { path: "/tasbih", label: "Tasbih", icon: "📿" },
    { path: "/tracker", label: "Tracker", icon: "✨" },
    { path: "/calendar", label: "Kalender", icon: "📅" },
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
                routerLocation.pathname === item.path
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
          {/* Location indicator */}
          <div className="hidden sm:flex items-center space-x-1 text-xs bg-white/10 px-2 py-1 rounded-lg">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span className="truncate max-w-[80px]">{userLocation?.city || "Jakarta"}</span>
            {permissionStatus === "granted" && (
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
            )}
          </div>
          
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
              data-testid="profile-dropdown-btn"
            >
              <div className={`w-8 h-8 ${darkMode ? "bg-gray-600" : "bg-white/20"} rounded-full flex items-center justify-center text-sm font-bold`}>
                {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className={`absolute right-0 mt-2 w-48 ${darkMode ? "bg-gray-700" : "bg-white"} rounded-xl shadow-lg py-2 z-50`}>
                <Link
                  to="/profile"
                  className={`block px-4 py-2 ${darkMode ? "text-white hover:bg-gray-600" : "text-gray-800 hover:bg-gray-50"} transition-colors`}
                  onClick={() => setDropdownOpen(false)}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Profile</span>
                  </div>
                </Link>
                <Link
                  to="/tracker"
                  className={`block px-4 py-2 ${darkMode ? "text-white hover:bg-gray-600" : "text-gray-800 hover:bg-gray-50"} transition-colors`}
                  onClick={() => setDropdownOpen(false)}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>Tracker</span>
                  </div>
                </Link>
                <hr className={`my-2 ${darkMode ? "border-gray-600" : "border-gray-100"}`} />
                <button
                  onClick={() => {
                    logout();
                    navigate("/login");
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-red-500 ${darkMode ? "hover:bg-gray-600" : "hover:bg-red-50"} transition-colors`}
                  data-testid="logout-btn"
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <nav className={`md:hidden ${darkMode ? "border-gray-700" : "border-white/20"} border-t`}>
        <div className="flex justify-around py-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center px-3 py-1 rounded-lg ${
                routerLocation.pathname === item.path
                  ? "bg-white/20"
                  : ""
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
};

export default Header;
