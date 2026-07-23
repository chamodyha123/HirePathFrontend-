import { useState, useEffect, useCallback } from 'react';
import platformAdminService from '../../api/platformAdminService';

const ROLES = ['All', 'Candidate', 'Recruiter', 'HiringManager', 'CompanyAdmin', 'Admin', 'SuperAdmin'];
const STATUS_OPTIONS = ['All', 'Active', 'Suspended'];

const getApiErrorMessage = (error, fallback) => {
    const data = error?.response?.data;
    if (typeof data === 'string' && data.trim()) return data;
    if (data?.message) {
        const dependencies = data?.dependencies?.$values || data?.dependencies;
        if (Array.isArray(dependencies) && dependencies.length > 0) {
            return `${data.message}\n\nLinked records:\n• ${dependencies.join('\n• ')}`;
        }
        return data.message;
    }
    if (data?.title) return data.title;
    return error?.message || fallback;
};

function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [actionLoading, setActionLoading] = useState(null); // userId being acted upon

    // Edit user modal state
    const [editModal, setEditModal] = useState({ open: false, user: null });
    const [editForm, setEditForm] = useState({ fullName: '', email: '', phoneNumber: '' });

    // Role change modal state
    const [roleModal, setRoleModal] = useState({ open: false, user: null });
    const [selectedRole, setSelectedRole] = useState('');

    // Delete confirm state
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const loadUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await platformAdminService.getAllUsers(
                searchTerm || null,
                roleFilter !== 'All' ? roleFilter : null,
                statusFilter !== 'All' ? statusFilter : null
            );
            setUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Users fetch error:', err);
            setError('Failed to load users. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [searchTerm, roleFilter, statusFilter]);

    useEffect(() => {
        const debounce = setTimeout(() => loadUsers(), 300);
        return () => clearTimeout(debounce);
    }, [loadUsers]);

    // ─── TOGGLE SUSPEND / ACTIVATE ────────────────────────────
    const handleToggleStatus = async (user) => {
        setActionLoading(user.id);
        try {
            const result = await platformAdminService.toggleUserStatus(user.id);
            setUsers(prev => prev.map(u =>
                u.id === user.id ? { ...u, status: result.status } : u
            ));
        } catch (err) {
            alert(`Failed to update status: ${err.response?.data?.message || err.message}`);
        } finally {
            setActionLoading(null);
        }
    };

    // ─── EDIT USER ────────────────────────────────────────────
    const openEditModal = (user) => {
        setEditForm({ fullName: user.fullName, email: user.email, phoneNumber: user.phoneNumber || '' });
        setEditModal({ open: true, user });
    };
    const handleEditSave = async () => {
        setActionLoading(editModal.user.id);
        try {
            await platformAdminService.updateUser(editModal.user.id, editForm);
            setEditModal({ open: false, user: null });
            loadUsers();
        } catch (err) {
            alert(`Failed to update user: ${getApiErrorMessage(err, 'Unknown error')}`);
        } finally {
            setActionLoading(null);
        }
    };

    // ─── CHANGE ROLE ──────────────────────────────────────────
    const openRoleModal = (user) => {
        setSelectedRole(user.role);
        setRoleModal({ open: true, user });
    };
    const handleRoleSave = async () => {
        setActionLoading(roleModal.user.id);
        try {
            await platformAdminService.updateUserRole(roleModal.user.id, selectedRole);
            setRoleModal({ open: false, user: null });
            loadUsers();
        } catch (err) {
            alert(`Failed to update role: ${getApiErrorMessage(err, 'Unknown error')}`);
        } finally {
            setActionLoading(null);
        }
    };

    // ─── DELETE USER ──────────────────────────────────────────
    const handleDelete = async (userId) => {
        setActionLoading(userId);
        try {
            await platformAdminService.deleteUser(userId);
            setDeleteConfirm(null);
            setUsers(prev => prev.filter(u => u.id !== userId));
        } catch (err) {
            alert(`Failed to delete user: ${getApiErrorMessage(err, 'Unknown error')}`);
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="card" style={{ padding: '28px' }}>
            <h3 style={{ margin: '0 0 8px 0', color: 'var(--dark-text)' }}>👥 Global User Accounts Directory</h3>
            <p style={{ color: '#64748b', margin: '0 0 24px 0', fontSize: '14.5px', lineHeight: '1.5' }}>
                Monitor cross-portal credentials logs, manage system privileges, and control access for all registered roles.
            </p>

            {/* ─── SEARCH & FILTER BAR ─── */}
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
                    {ROLES.map(r => <option key={r} value={r}>{r === 'All' ? 'All Roles' : r}</option>)}
                </select>
                <select
                    className="form-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ flex: 1, minWidth: '130px', margin: 0 }}
                >
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s === 'All' ? 'All Status' : s}</option>)}
                </select>
            </div>

            {/* ─── ERROR STATE ─── */}
            {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '12px 16px', color: '#991b1b', marginBottom: '16px' }}>
                    ⚠️ {error}
                </div>
            )}

            {/* ─── LOADING STATE ─── */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>⏳ Querying Identity Directory...</div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table className="tracker-table" style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th>Full Name</th>
                                <th>Username</th>
                                <th>Email Address</th>
                                <th>System Role</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
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
                                        <span style={{
                                            backgroundColor: user.status === 'Active' ? '#d1fae5' : '#fee2e2',
                                            color: user.status === 'Active' ? '#065f46' : '#991b1b',
                                            padding: '4px 10px', borderRadius: '6px',
                                            fontSize: '12px', fontWeight: '700', display: 'inline-block'
                                        }}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                            <button
                                                onClick={() => openEditModal(user)}
                                                className="auth-btn"
                                                disabled={actionLoading === user.id}
                                                style={{ padding: '5px 11px', width: 'auto', fontSize: '12px', margin: 0, background: '#3b82f6' }}
                                            >✏️ Edit</button>
                                            <button
                                                onClick={() => openRoleModal(user)}
                                                className="auth-btn"
                                                disabled={actionLoading === user.id}
                                                style={{ padding: '5px 11px', width: 'auto', fontSize: '12px', margin: 0, background: '#8b5cf6' }}
                                            >🔑 Role</button>
                                            <button
                                                onClick={() => handleToggleStatus(user)}
                                                className="auth-btn"
                                                disabled={actionLoading === user.id}
                                                style={{
                                                    padding: '5px 11px', width: 'auto', fontSize: '12px', margin: 0,
                                                    background: user.status === 'Active' ? '#ef4444' : '#10b981'
                                                }}
                                            >
                                                {actionLoading === user.id ? '...' : user.status === 'Active' ? '🛑 Block' : '✅ Unblock'}
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(user.id)}
                                                className="auth-btn"
                                                disabled={actionLoading === user.id}
                                                style={{ padding: '5px 11px', width: 'auto', fontSize: '12px', margin: 0, background: '#64748b' }}
                                            >🗑️ Del</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--muted)', padding: '24px' }}>
                                        No accounts match the search parameters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ─── EDIT USER MODAL ─── */}
            {editModal.open && (
                <div style={modalOverlay}>
                    <div style={modalBox}>
                        <h4 style={{ margin: '0 0 16px 0' }}>✏️ Edit User: {editModal.user.fullName}</h4>
                        <input className="form-input" placeholder="Full Name" value={editForm.fullName}
                            onChange={e => setEditForm(f => ({ ...f, fullName: e.target.value }))} />
                        <input className="form-input" placeholder="Email" value={editForm.email}
                            onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
                        <input className="form-input" placeholder="Phone Number" value={editForm.phoneNumber}
                            onChange={e => setEditForm(f => ({ ...f, phoneNumber: e.target.value }))} />
                        <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                            <button className="auth-btn" onClick={handleEditSave}
                                style={{ flex: 1, margin: 0 }} disabled={actionLoading !== null}>
                                {actionLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button className="auth-btn" onClick={() => setEditModal({ open: false, user: null })}
                                style={{ flex: 1, margin: 0, background: '#64748b' }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── ROLE CHANGE MODAL ─── */}
            {roleModal.open && (
                <div style={modalOverlay}>
                    <div style={modalBox}>
                        <h4 style={{ margin: '0 0 16px 0' }}>🔑 Change Role: {roleModal.user.fullName}</h4>
                        <select className="form-select" value={selectedRole}
                            onChange={e => setSelectedRole(e.target.value)}>
                            {ROLES.filter(r => r !== 'All').map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                            <button className="auth-btn" onClick={handleRoleSave}
                                style={{ flex: 1, margin: 0, background: '#8b5cf6' }} disabled={actionLoading !== null}>
                                {actionLoading ? 'Updating...' : 'Update Role'}
                            </button>
                            <button className="auth-btn" onClick={() => setRoleModal({ open: false, user: null })}
                                style={{ flex: 1, margin: 0, background: '#64748b' }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── DELETE CONFIRM MODAL ─── */}
            {deleteConfirm && (
                <div style={modalOverlay}>
                    <div style={modalBox}>
                        <h4 style={{ margin: '0 0 12px 0', color: '#dc2626' }}>⚠️ Confirm Delete</h4>
                        <p style={{ color: '#64748b', marginBottom: '20px' }}>
                            Are you sure you want to permanently delete this user? This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="auth-btn" onClick={() => handleDelete(deleteConfirm)}
                                style={{ flex: 1, margin: 0, background: '#dc2626' }} disabled={actionLoading !== null}>
                                {actionLoading ? 'Deleting...' : '🗑️ Delete User'}
                            </button>
                            <button className="auth-btn" onClick={() => setDeleteConfirm(null)}
                                style={{ flex: 1, margin: 0, background: '#64748b' }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const modalOverlay = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
};
const modalBox = {
    background: '#fff', borderRadius: '16px', padding: '28px',
    minWidth: '380px', maxWidth: '480px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.25)'
};

export default Users;