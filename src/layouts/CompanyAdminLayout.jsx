import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { FaBriefcase, FaChartLine, FaSignOutAlt, FaUserTie, FaUsers, FaBuilding } from "react-icons/fa";
import "./CompanyAdminLayout.css";

const links = [
  { to: "/company-admin", label: "Dashboard", icon: <FaChartLine />, end: true },
  { to: "/company-admin/hiring-managers", label: "Hiring Managers", icon: <FaUserTie /> },
  { to: "/company-admin/recruiters", label: "Recruiters", icon: <FaUsers /> },
  { to: "/recruiter-dashboard/jobs", label: "Jobs", icon: <FaBriefcase /> },
];

export default function CompanyAdminLayout() {
  const navigate = useNavigate();
  let user = {};
  try { user = JSON.parse(localStorage.getItem("user") || "{}"); } catch { user = {}; }

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("roles");
    navigate("/login?portal=company", { replace: true });
  };

  return (
    <div className="company-admin-shell">
      <aside className="company-admin-sidebar">
        <div className="company-admin-brand">
          <div className="company-admin-logo">H</div>
          <div><strong>HirePath</strong><span>Company Admin</span></div>
        </div>

        <nav className="company-admin-nav">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => isActive ? "active" : ""}>
              {link.icon}<span>{link.label}</span>
            </NavLink>
          ))}
          <NavLink to="/company-admin/company-profile"><FaBuilding /><span>Company Profile</span></NavLink>
        </nav>

        <div className="company-admin-user">
          <div><strong>{user.fullName || "Company Administrator"}</strong><span>{user.email || ""}</span></div>
          <button onClick={logout} title="Sign out"><FaSignOutAlt /></button>
        </div>
      </aside>
      <main className="company-admin-content"><Outlet /></main>
    </div>
  );
}
