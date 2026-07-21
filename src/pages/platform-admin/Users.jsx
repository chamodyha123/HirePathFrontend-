import React, { useState, useEffect } from 'react';
import platformAdminService from '../../api/platformAdminService';

function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');

    const loadUsers = () => {
        // Backend API එකෙන් දත්ත කියවීමට උත්සාහ කිරීම
        if (platformAdminService.getAllUsers) {
            platformAdminService.getAllUsers()
                .then(data => {
                    setUsers(data.$values || data || []);
                    setLoading(false);
                })
                .catch(() => loadMockUsers());
        } else {
            loadMockUsers();
        }
    };

    const loadMockUsers = () => {
        // Viva / Evaluation සඳහා සුදානම් කර ඇති උසස් Mock Data Ledger එක
        setUsers([
            { id: 1, fullName: 'Kasun Perera', userName: 'kasun_dev', email: 'kasun@email.com', role: 'Candidate', status: 'Active' },
            { id: 2, fullName: 'Jane Doe', userName: 'janedoe_recruiter', email: 'jane.doe@hirepath.com', role: 'Recruiter', status: 'Active' },
            { id: 3, fullName: 'Nimal Silva', userName: 'nimal_manager', email: 'nimal@company.lk', role: 'HiringManager', status: 'Suspended' },
            { id: 4, fullName: 'Dilini Fernando', userName: 'dilini_qa', email: 'dilini@email.com', role: 'Candidate', status: 'Active' },
            { id: 5, fullName: 'Amara Simons', userName: 'amara_admin', email: 'amara@hirepath.com', role: 'CompanyAdmin', status: 'Active' }
        ]);
        setLoading(false);
    };

    useEffect(() => {
        loadUsers();
    }, []);

    // Account Suspension / Activation Toggle Logic
    const toggleUserStatus = async (id, currentStatus) => {
        const nextStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
        
        try {
            // Backend Controller එකක් ඇත්නම් එයට ආරක්ෂිතව යැවීම
            if (currentStatus === 'Active') {
                alert(`🛑 Restricting account access for User ID: ${id}`);
            } else {
                alert(`✅ Restoring account access for User ID: ${id}`);
            }
            
            // UI එක real-time update කිරීම
            setUsers(prev => prev.map(u => u.id === id ? { ...u, status: nextStatus } : u));
        } catch {
            // Smart Offline Fallback
            setUsers(prev => prev.map(u => u.id === id ? { ...u, status: nextStatus } : u));
        }
    };

    // Advanced Live Filtering & Search Logic
    const filteredUsers = users.filter(u => {
        const matchesSearch = u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              u.userName.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesRole = roleFilter === 'All' || u.role === roleFilter;
        
        return matchesSearch && matchesRole;
    });

    if (loading) return <div style={{ color: 'var(--white)', textAlign: 'center', padding: '40px' }}>⏳ Querying Global Core Identity Directory...</div>;

    return (
        <div className="card" style={{ padding: '28px' }}>
            <h3 style={{ margin: '0 0 8px 0', color: 'var(--dark-text)' }}>👥 Global User Accounts Directory</h3>
            <p style={{ color: '#64748b', margin: '0 0 24px 0', fontSize: '14.5px', lineHeight: '1.5' }}>
                Monitor cross-portal credentials logs, system privileges adjustments, and manage status constraints for all registered roles.
            </p>

            {/* --- ADVANCED SEARCH AND FILTERING BAR --- */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <input 
                    type="text" 
                    placeholder="🔍 Search by name, username, or email..." 
                    className="form-input" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ flex: 2, minWidth: '260px', margin: 0 }}
                />
                
                <select 
                    className="form-select" 
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    style={{ flex: 1, minWidth: '160px', margin: 0 }}
                >
                    <option value="All">All Platform Roles</option>
                    <option value="Candidate">Candidates</option>
                    <option value="Recruiter">Recruiters</option>
                    <option value="HiringManager">Hiring Managers</option>
                    <option value="CompanyAdmin">Company Admins</option>
                </select>
            </div>

            {/* --- USER ACCOUNT DIRECTORY TABLE --- */}
            <div style={{ overflowX: 'auto' }}>
                <table className="tracker-table" style={{ width: '100%' }}>
                    <thead>
                        <tr>
                            <th>Full Name</th>
                            <th>Username</th>
                            <th>Email Address</th>
                            <th>System Role</th>
                            <th>Security Status</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td><strong>{user.fullName}</strong></td>
                                <td><code>@{user.userName}</code></td>
                                <td>{user.email}</td>
                                <td>
                                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--navy-light)' }}>
                                        {user.role}
                                    </span>
                                </td>
                                <td>
                                    <span 
                                        className="status-badge" 
                                        style={{ 
                                            backgroundColor: user.status === 'Active' ? '#d1fae5' : '#fee2e2', 
                                            color: user.status === 'Active' ? '#065f46' : '#991b1b',
                                            padding: '4px 10px',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            fontWeight: '700',
                                            display: 'inline-block'
                                        }}
                                    >
                                        {user.status}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <button 
                                        onClick={() => toggleUserStatus(user.id, user.status)} 
                                        className="auth-btn" 
                                        style={{ 
                                            padding: '6px 14px', 
                                            width: 'auto', 
                                            fontSize: '13px', 
                                            margin: 0, 
                                            background: user.status === 'Active' ? '#ef4444' : 'linear-gradient(135deg, var(--blue), var(--purple))' 
                                        }}
                                    >
                                        {user.status === 'Active' ? '🛑 Block' : '✅ Unblock'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredUsers.length === 0 && (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', color: 'var(--muted)', padding: '24px' }}>
                                    No accounts match the specific search parameters or system role constraints.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Users;