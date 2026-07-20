import React from 'react';
import { Outlet } from 'react-router-dom';
import PlatformAdminSidebar from '../components/platform-admin/PlatformAdminSidebar';

function PlatformAdminLayout() {
    const userJson = localStorage.getItem("user");
    let adminName = "System Admin";
    
    if (userJson) {
        try {
            const user = JSON.parse(userJson);
            adminName = user.fullName || user.userName || adminName;
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <div className="dashboard-container auth-page" style={{ justifyContent: 'flex-start', padding: 0, alignItems: 'stretch' }}>
            <PlatformAdminSidebar />
            
            <main className="content-area" style={{ padding: '40px', overflowY: 'auto', position: 'relative', zIndex: 2 }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid var(--border)', paddingBottom: '20px' }}>
                    <div>
                        <h2 style={{ fontSize: '26px', fontWeight: '700', color: 'var(--white)', margin: 0, letterSpacing: '-0.5px' }}>🛡️ Platform Infrastructure Control</h2>
                        <p style={{ color: 'var(--muted)', margin: '4px 0 0 0', fontSize: '14px' }}>HirePath Core Systems Administration</p>
                    </div>
                    <div style={{ background: 'var(--glass)', padding: '10px 20px', borderRadius: '14px', border: '1px solid var(--border)', color: 'var(--cyan)', fontWeight: '800', fontSize: '14px' }}>
                        ⚡ Authorized Account: {adminName}
                    </div>
                </header>

                <section style={{ width: '100%' }}>
                    <Outlet />
                </section>
            </main>
        </div>
    );
}

export default PlatformAdminLayout;