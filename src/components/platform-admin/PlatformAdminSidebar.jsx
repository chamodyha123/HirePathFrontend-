import { NavLink, useNavigate } from "react-router-dom";

function PlatformAdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("roles");
    localStorage.removeItem("role");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("refreshToken");

    navigate("/login", { replace: true });
  };

  const getNavClass = ({ isActive }) =>
    `tab-button ${isActive ? "active" : ""}`;

  return (
    <aside
      className="sidebar"
      style={{
        backgroundColor: "var(--navy)",
      }}
    >
      <div className="sidebar-top">
        <div
          className="logo-area"
          style={{
            borderBottom: "1px solid var(--border)",
          }}
        >
          <h2
            className="logo-text"
            style={{
              color: "var(--cyan)",
            }}
          >
            HirePath AI
          </h2>

          <p
            className="sub-text"
            style={{
              color: "var(--muted)",
            }}
          >
            Platform Admin Panel
          </p>
        </div>

        <ul className="tab-list">
          <li>
            <NavLink
              to="/platform-admin"
              end
              className={getNavClass}
              style={{
                display: "block",
                textDecoration: "none",
              }}
            >
              📊 Dashboard Overview
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/platform-admin/companies"
              className={getNavClass}
              style={{
                display: "block",
                textDecoration: "none",
              }}
            >
              🏢 All Companies
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/platform-admin/companies/pending"
              className={getNavClass}
              style={{
                display: "block",
                textDecoration: "none",
              }}
            >
              ⏳ Pending Requests
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/platform-admin/users"
              className={getNavClass}
              style={{
                display: "block",
                textDecoration: "none",
              }}
            >
              👥 Manage Users
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/platform-admin/analytics"
              className={getNavClass}
              style={{
                display: "block",
                textDecoration: "none",
              }}
            >
              📈 Platform Analytics
            </NavLink>
          </li>
        </ul>
      </div>

      <div
        className="sidebar-bottom"
        style={{
          borderTop: "1px solid var(--border)",
        }}
      >
        <button
          type="button"
          onClick={handleLogout}
          className="logout-button"
        >
          🚪 Exit Portal
        </button>
      </div>
    </aside>
  );
}

export default PlatformAdminSidebar;