import { useState, useEffect } from "react";
import { useLocation, useTheme } from "@/context";

export const LocationPermissionModal = () => {
  const { permissionStatus, refreshLocation, loading, isUsingDefaultLocation } = useLocation();
  const { darkMode } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Show modal if using default location and not already dismissed
    const wasDismissed = sessionStorage.getItem("locationModalDismissed");
    if (!wasDismissed && isUsingDefaultLocation && !loading && permissionStatus !== "granted") {
      // Delay showing modal for better UX
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isUsingDefaultLocation, loading, permissionStatus]);

  const handleAllowLocation = () => {
    refreshLocation();
    setShowModal(false);
  };

  const handleDismiss = () => {
    setShowModal(false);
    setDismissed(true);
    sessionStorage.setItem("locationModalDismissed", "true");
  };

  if (!showModal || dismissed) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className={`w-full max-w-md ${darkMode ? "bg-gray-800" : "bg-white"} rounded-2xl shadow-2xl overflow-hidden transform transition-all`}>
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-bold">Izinkan Akses Lokasi</h2>
          <p className="text-green-100 text-sm mt-1">Untuk waktu shalat yang lebih akurat</p>
        </div>

        {/* Content */}
        <div className={`p-6 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className={`w-10 h-10 rounded-full ${darkMode ? "bg-green-900/50" : "bg-green-100"} flex items-center justify-center flex-shrink-0`}>
                <span className="text-lg">🕌</span>
              </div>
              <div>
                <p className={`font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>Waktu Shalat Akurat</p>
                <p className="text-sm">Dapatkan jadwal shalat sesuai lokasi Anda saat ini</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className={`w-10 h-10 rounded-full ${darkMode ? "bg-blue-900/50" : "bg-blue-100"} flex items-center justify-center flex-shrink-0`}>
                <span className="text-lg">🌍</span>
              </div>
              <div>
                <p className={`font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>Otomatis Update</p>
                <p className="text-sm">Waktu shalat akan menyesuaikan saat Anda bepergian</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className={`w-10 h-10 rounded-full ${darkMode ? "bg-purple-900/50" : "bg-purple-100"} flex items-center justify-center flex-shrink-0`}>
                <span className="text-lg">🔒</span>
              </div>
              <div>
                <p className={`font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>Privasi Terjaga</p>
                <p className="text-sm">Lokasi hanya digunakan untuk menghitung waktu shalat</p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 space-y-3">
            <button
              onClick={handleAllowLocation}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Izinkan Lokasi</span>
              </div>
            </button>
            <button
              onClick={handleDismiss}
              className={`w-full py-3 border ${darkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"} rounded-xl font-medium transition-colors`}
            >
              Nanti Saja (Gunakan Jakarta)
            </button>
          </div>

          <p className={`text-xs text-center mt-4 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
            Anda bisa mengubah ini kapan saja di pengaturan browser
          </p>
        </div>
      </div>
    </div>
  );
};

export default LocationPermissionModal;
