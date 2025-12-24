import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth, useTheme } from "@/context";
import { Header } from "@/components/common";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AddAmalPage = () => {
  const { token } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  
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

export default AddAmalPage;
