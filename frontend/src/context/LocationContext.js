import { useState, useEffect, createContext, useContext } from "react";

const LocationContext = createContext(null);

export const useLocation = () => useContext(LocationContext);

// Default location: Jakarta
const DEFAULT_LOCATION = {
  latitude: -6.2088,
  longitude: 106.8456,
  city: "Jakarta"
};

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(() => {
    const saved = localStorage.getItem("userLocation");
    return saved ? JSON.parse(saved) : DEFAULT_LOCATION;
  });
  const [permissionStatus, setPermissionStatus] = useState("prompt"); // prompt, granted, denied
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    requestLocation();
  }, []);

  const requestLocation = async () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation tidak didukung oleh browser Anda");
      setPermissionStatus("denied");
      setLoading(false);
      return;
    }

    try {
      // Check permission status first
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: "geolocation" });
        setPermissionStatus(permission.state);
        
        // Listen for permission changes
        permission.onchange = () => {
          setPermissionStatus(permission.state);
          if (permission.state === "granted") {
            getCurrentPosition();
          }
        };
      }

      getCurrentPosition();
    } catch (err) {
      console.error("Error checking permission:", err);
      getCurrentPosition();
    }
  };

  const getCurrentPosition = () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          city: "Lokasi Anda"
        };

        // Try to get city name using reverse geocoding
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`
          );
          const data = await response.json();
          if (data.address) {
            newLocation.city = data.address.city || data.address.town || data.address.village || data.address.county || "Lokasi Anda";
          }
        } catch (e) {
          console.log("Could not get city name");
        }

        setLocation(newLocation);
        setPermissionStatus("granted");
        localStorage.setItem("userLocation", JSON.stringify(newLocation));
        setLoading(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setPermissionStatus("denied");
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError("Izin lokasi ditolak. Menggunakan lokasi default (Jakarta)");
            break;
          case error.POSITION_UNAVAILABLE:
            setError("Informasi lokasi tidak tersedia");
            break;
          case error.TIMEOUT:
            setError("Waktu permintaan lokasi habis");
            break;
          default:
            setError("Terjadi kesalahan saat mendapatkan lokasi");
        }
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000 // Cache for 10 minutes
      }
    );
  };

  const refreshLocation = () => {
    requestLocation();
  };

  return (
    <LocationContext.Provider 
      value={{ 
        location, 
        permissionStatus, 
        loading, 
        error, 
        refreshLocation,
        isUsingDefaultLocation: location.latitude === DEFAULT_LOCATION.latitude && location.longitude === DEFAULT_LOCATION.longitude
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export default LocationContext;
