import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth, useTheme, useLocation } from "@/context";
import { Header, LocationBanner } from "@/components/common";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const HomePage = () => {
  const { user, token } = useAuth();
  const { darkMode } = useTheme();
  const { location: userLocation } = useLocation();
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [hijriDate, setHijriDate] = useState(null);
  const [dailyAmals, setDailyAmals] = useState([]);
  const [prayerStats, setPrayerStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [userLocation]);

  const fetchData = async () => {
    try {
      const [prayerRes, statsRes, amalsRes] = await Promise.all([
        axios.get(`${API}/prayer-times`, {
          params: {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude
          }
        }),
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
        {/* Location Banner */}
        <LocationBanner />
        
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

export default HomePage;
