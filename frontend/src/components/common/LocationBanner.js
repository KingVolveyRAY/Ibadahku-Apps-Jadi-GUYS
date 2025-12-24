import { useTheme, useLocation } from "@/context";

export const LocationBanner = () => {
  const { darkMode } = useTheme();
  const { location, permissionStatus, error, refreshLocation, isUsingDefaultLocation, loading } = useLocation();

  if (loading) {
    return (
      <div className={`${darkMode ? "bg-blue-900/30 border-blue-800" : "bg-blue-50 border-blue-200"} border rounded-xl p-4 mb-4`}>
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
          <p className={`text-sm ${darkMode ? "text-blue-300" : "text-blue-700"}`}>
            Meminta izin lokasi untuk waktu shalat yang akurat...
          </p>
        </div>
      </div>
    );
  }

  if (permissionStatus === "denied" || isUsingDefaultLocation) {
    return (
      <div className={`${darkMode ? "bg-yellow-900/30 border-yellow-800" : "bg-yellow-50 border-yellow-200"} border rounded-xl p-4 mb-4`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <span className="text-xl">📍</span>
            <div>
              <p className={`text-sm font-medium ${darkMode ? "text-yellow-300" : "text-yellow-800"}`}>
                {isUsingDefaultLocation ? "Menggunakan Lokasi Default" : "Izin Lokasi Ditolak"}
              </p>
              <p className={`text-xs mt-1 ${darkMode ? "text-yellow-400" : "text-yellow-700"}`}>
                {error || `Waktu shalat berdasarkan lokasi ${location.city}. Aktifkan lokasi untuk hasil yang lebih akurat.`}
              </p>
            </div>
          </div>
          <button
            onClick={refreshLocation}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium ${
              darkMode 
                ? "bg-yellow-800 text-yellow-200 hover:bg-yellow-700" 
                : "bg-yellow-200 text-yellow-800 hover:bg-yellow-300"
            } transition-colors`}
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (permissionStatus === "granted") {
    return (
      <div className={`${darkMode ? "bg-green-900/30 border-green-800" : "bg-green-50 border-green-200"} border rounded-xl p-4 mb-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xl">✅</span>
            <div>
              <p className={`text-sm font-medium ${darkMode ? "text-green-300" : "text-green-800"}`}>
                Lokasi Aktif: {location.city}
              </p>
              <p className={`text-xs ${darkMode ? "text-green-400" : "text-green-700"}`}>
                Waktu shalat sesuai dengan lokasi Anda
              </p>
            </div>
          </div>
          <button
            onClick={refreshLocation}
            className={`p-2 rounded-lg ${
              darkMode 
                ? "hover:bg-green-800 text-green-300" 
                : "hover:bg-green-200 text-green-700"
            } transition-colors`}
            title="Perbarui Lokasi"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default LocationBanner;
