import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth, useTheme, useLocation } from "@/context";
import { Header, LocationBanner } from "@/components/common";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const PrayerPage = () => {
  const { token } = useAuth();
  const { darkMode } = useTheme();
  const { location: userLocation, permissionStatus, loading: locationLoading } = useLocation();
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [prayerTrack, setPrayerTrack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Use local date format
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  useEffect(() => {
    if (!locationLoading) {
      fetchData();
    }
    // Update current time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, [userLocation, locationLoading]);

  const fetchData = async () => {
    try {
      const [timesRes, trackRes] = await Promise.all([
        axios.get(`${API}/prayer-times`, {
          params: {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude
          }
        }),
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

  if (loading || locationLoading) {
    return (
      <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
        <Header />
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
          {locationLoading && (
            <p className={`mt-4 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              Mendapatkan lokasi Anda...
            </p>
          )}
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
        {/* Location Banner */}
        <LocationBanner />
        
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
              {/* Show location info */}
              <div className="flex items-center mt-2 text-green-100 text-xs">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span>{userLocation.city}</span>
                {permissionStatus === "granted" && (
                  <span className="ml-1 w-1.5 h-1.5 bg-green-300 rounded-full"></span>
                )}
              </div>
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

export default PrayerPage;
