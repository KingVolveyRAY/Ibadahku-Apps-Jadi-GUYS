import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth, useTheme } from "@/context";
import { Header } from "@/components/common";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const CalendarPage = () => {
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
    
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
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
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return allAmals.some(amal => amal.scheduled_date === dateStr);
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

export default CalendarPage;
