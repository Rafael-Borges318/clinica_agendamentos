import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const adminPassword = localStorage.getItem("admin_password");

  if (!adminPassword) {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
}
