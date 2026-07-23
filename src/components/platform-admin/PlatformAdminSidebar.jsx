import { NavLink } from 'react-router-dom';

function PlatformAdminSidebar() {
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
    };

    return (
        <aside className="sidebar" style={{ backgroundColor: 'var(--navy)' }}>
            <div className="sidebar-top">
                <div className="logo-area" style={{ borderBottom: '1px solid var(--border)' }}>
                    <h2 className="logo-text" style={{ color: 'var(--cyan)' }}>HirePath AI</h2>
                    <p className="sub-text" style={{ color: 'var(--muted)' }}>Platform Admin Panel</p>
                </div>

                <ul className="tab-list">
                    <li>
                        <NavLink to="/platform-admin" end className={({ isActive }) => `tab-button ${isActive ? 'active' : ''}`} style={{ textDecoration: 'none', display: 'block' }}>
                            📊 Dashboard Overview
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/platform-admin/companies" className={({ isActive }) => `tab-button ${isActive ? 'active' : ''}`} style={{ textDecoration: 'none', display: 'block' }}>
                            🏢 All Companies
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/platform-admin/companies/pending" className={({ isActive }) => `tab-button ${isActive ? 'active' : ''}`} style={{ textDecoration: 'none', display: 'block' }}>
                            ⏳ Pending Requests
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/platform-admin/users" className={({ isActive }) => `tab-button ${isActive ? 'active' : ''}`} style={{ textDecoration: 'none', display: 'block' }}>
                            👥 Manage Users
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/platform-admin/analytics" className={({ isActive }) => `tab-button ${isActive ? 'active' : ''}`} style={{ textDecoration: 'none', display: 'block' }}>
                            📈 Platform Analytics
                        </NavLink>
                    </li>
                </ul>
            </div>

            <div className="sidebar-bottom" style={{ borderTop: '1px solid var(--border)' }}>
                <button onClick={handleLogout} className="logout-button">
                    🚪 Exit Portal
                </button>
            </div>
        </aside>
    );
}

export default PlatformAdminSidebar;