import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth, useTheme } from "@/context";
import { Header } from "@/components/common";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const ProfilePage = () => {
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
        {/* Profile Header - Beautiful Gradient */}
        <div className={`${darkMode ? "bg-gradient-to-br from-green-600 via-emerald-500 to-teal-500" : "bg-gradient-to-br from-green-400 via-emerald-400 to-teal-400"} rounded-2xl p-6 text-white mb-6 shadow-lg relative overflow-hidden`}>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          <div className="absolute top-1/2 right-10 w-20 h-20 bg-white/5 rounded-full"></div>
          
          <div className="relative flex flex-col items-center text-center py-4">
            {/* Profile Avatar with gradient ring */}
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-white/30 to-white/10 p-1">
                <div className={`w-full h-full ${darkMode ? "bg-gray-800" : "bg-white"} rounded-full flex items-center justify-center shadow-lg`}>
                  <span className={`text-4xl font-bold ${darkMode ? "text-green-400" : "text-green-500"}`}>
                    {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
              </div>
              {/* Online indicator */}
              <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            
            <h2 className="text-2xl font-bold mb-1">{user?.full_name}</h2>
            <p className="text-white/80 text-sm mb-3">{user?.email}</p>
            
            {/* Stats Row */}
            <div className="flex items-center space-x-6 mt-2">
              <div className="text-center">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-1">
                  <span className="text-lg">🕌</span>
                </div>
                <p className="text-xs text-white/70">Member</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-1">
                  <span className="text-lg">⭐</span>
                </div>
                <p className="text-xs text-white/70">Active</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-1">
                  <span className="text-lg">🌙</span>
                </div>
                <p className="text-xs text-white/70">IbadahKu</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} rounded-xl shadow-sm border p-6`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg ${darkMode ? "bg-green-900/50" : "bg-green-100"} flex items-center justify-center`}>
                <svg className={`w-5 h-5 ${darkMode ? "text-green-400" : "text-green-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className={`font-semibold ${darkMode ? "text-white" : "text-gray-800"} text-lg`}>Informasi Akun</h3>
            </div>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-md hover:shadow-lg"
                data-testid="edit-profile-btn"
              >
                ✏️ Edit Profile
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

export default ProfilePage;
