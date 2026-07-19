import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children, roles = [] }) {
  const location = useLocation();
  const token = localStorage.getItem("token");

  let userRoles = [];
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    userRoles = user.roles || JSON.parse(localStorage.getItem("roles") || "[]");
  } catch {
    userRoles = [];
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles.length > 0 && !roles.some((role) => userRoles.includes(role))) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
