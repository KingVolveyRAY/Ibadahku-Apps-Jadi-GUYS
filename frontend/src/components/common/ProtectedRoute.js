import { Navigate } from "react-router-dom";
import { useAuth, useTheme } from "@/context";

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const { darkMode } = useTheme();
  
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-gray-900" : "bg-gradient-to-b from-green-100 to-green-200"}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

export default ProtectedRoute;
