import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children, roles = [] }) {
  const location = useLocation();
  const token = localStorage.getItem("token");

  let userRoles = [];
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const storedRoles = JSON.parse(localStorage.getItem("roles") || "[]");
    const rawRoles = Array.isArray(user.roles)
      ? user.roles
      : user.role
        ? [user.role]
        : storedRoles;

    userRoles = rawRoles.map((role) => String(role).trim().toLowerCase());
  } catch {
    userRoles = [];
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const allowedRoles = roles.map((role) => String(role).trim().toLowerCase());

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.some((role) => userRoles.includes(role))
  ) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
