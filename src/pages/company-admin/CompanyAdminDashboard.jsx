import { Link } from "react-router-dom";
import { FaBriefcase, FaBuilding, FaUserTie, FaUsers } from "react-icons/fa";

export default function CompanyAdminDashboard() {
  let user = {};
  try { user = JSON.parse(localStorage.getItem("user") || "{}"); } catch { user = {}; }

  return (
    <div className="company-admin-page">
      <header className="company-admin-header">
        <div><h1>Company Admin Dashboard</h1><p>Welcome back, {user.fullName || "Company Administrator"}. Manage your recruitment team and company workflow.</p></div>
        <span className="company-admin-badge">Company account active</span>
      </header>

      <section className="company-admin-stats">
        <div className="company-admin-stat"><span>Hiring Managers</span><strong>Manage</strong></div>
        <div className="company-admin-stat"><span>Recruiters</span><strong>Manage</strong></div>
        <div className="company-admin-stat"><span>Open Jobs</span><strong>View</strong></div>
        <div className="company-admin-stat"><span>Company Profile</span><strong>Review</strong></div>
      </section>

      <section className="company-admin-grid">
        <div className="company-admin-card"><div className="company-admin-card-icon"><FaUserTie /></div><h3>Hiring Managers</h3><p>Invite managers, review their accounts, and activate or deactivate access.</p><Link to="/company-admin/hiring-managers">Manage Hiring Managers</Link></div>
        <div className="company-admin-card"><div className="company-admin-card-icon"><FaUsers /></div><h3>Recruiter Team</h3><p>Open the recruiter workspace to manage recruiter-side recruitment activities.</p><Link to="/recruiter-dashboard">Open Recruiter Workspace</Link></div>
        <div className="company-admin-card"><div className="company-admin-card-icon"><FaBriefcase /></div><h3>Job Management</h3><p>Create, update and monitor jobs published by your company.</p><Link to="/recruiter-dashboard/jobs">Manage Jobs</Link></div>
        <div className="company-admin-card"><div className="company-admin-card-icon"><FaBuilding /></div><h3>Company Profile</h3><p>Review company details created through the approved onboarding request.</p><Link to="/company-admin/company-profile">View Company Profile</Link></div>
      </section>
    </div>
  );
}
