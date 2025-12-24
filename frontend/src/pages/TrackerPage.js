import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth, useTheme, useLocation } from "@/context";
import { Header, LocationBanner } from "@/components/common";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const TrackerPage = () => {
  const { token } = useAuth();
  const { darkMode } = useTheme();
  const { location: userLocation } = useLocation();
  const navigate = useNavigate();
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [prayerTrack, setPrayerTrack] = useState(null);
  const [amals, setAmals] = useState([]);
  const [dailyNote, setDailyNote] = useState(null);
  const [prayerStats, setPrayerStats] = useState(null);
  const [notes, setNotes] = useState("");
  const [reflections, setReflections] = useState("");
  const [loading, setLoading] = useState(true);
  
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

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
  }, [userLocation]);

  const fetchData = async () => {
    try {
      const [timesRes, trackRes, amalsRes, noteRes, statsRes] = await Promise.all([
        axios.get(`${API}/prayer-times`, {
          params: {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude
          }
        }),
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
        {/* Location Banner */}
        <LocationBanner />
        
        {/* Beautiful Header Card */}
        <div className={`${darkMode ? "bg-gradient-to-r from-purple-700 via-pink-600 to-rose-500" : "bg-gradient-to-r from-purple-500 via-pink-500 to-rose-400"} rounded-2xl p-6 text-white mb-6 shadow-lg relative overflow-hidden`}>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">✨</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">Tracker Amal</h1>
                <p className="text-white/80 text-sm">Pantau perjalanan ibadahmu</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Hari ini</p>
                <p className="font-medium">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              </div>
              {prayerTimes?.date?.hijri && (
                <div className="text-right">
                  <p className="text-white/70 text-sm">Hijriah</p>
                  <p className="font-medium">{prayerTimes.date.hijri.day} {prayerTimes.date.hijri.month.en} {prayerTimes.date.hijri.year} H</p>
                </div>
              )}
            </div>
          </div>
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

export default TrackerPage;
