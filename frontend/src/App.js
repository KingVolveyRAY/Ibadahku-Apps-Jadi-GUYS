import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, AuthProvider, LocationProvider } from "@/context";
import { ProtectedRoute, LocationPermissionModal } from "@/components/common";
import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  HomePage,
  PrayerPage,
  CalendarPage,
  ProfilePage,
  TrackerPage,
  AddAmalPage,
  TasbihPage
} from "@/pages";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LocationProvider>
          <BrowserRouter>
            <LocationPermissionModal />
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
              <Route path="/prayer" element={<ProtectedRoute><PrayerPage /></ProtectedRoute>} />
              <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
              <Route path="/tasbih" element={<ProtectedRoute><TasbihPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/tracker" element={<ProtectedRoute><TrackerPage /></ProtectedRoute>} />
              <Route path="/add-amal" element={<ProtectedRoute><AddAmalPage /></ProtectedRoute>} />
              <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
          </BrowserRouter>
        </LocationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
