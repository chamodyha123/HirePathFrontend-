import { useState, useEffect, useCallback } from 'react';
import platformAdminService from '../../api/platformAdminService';

function Companies() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const loadCompanies = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await platformAdminService.getAllCompanies();
            setCompanies(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Companies fetch error:', err);
            setError('Failed to load companies. Please check that the backend is running.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = window.setTimeout(() => { void loadCompanies(); }, 0);
        return () => window.clearTimeout(timer);
    }, [loadCompanies]);

    const handleToggleStatus = async (company) => {
        setActionLoading(company.id);
        try {
            if (company.status === 'Approved' || company.status === 'Active') {
                await platformAdminService.suspendCompany(company.id);
                setCompanies(prev => prev.map(c => c.id === company.id ? { ...c, status: 'Suspended' } : c));
            } else {
                await platformAdminService.activateCompany(company.id);
                setCompanies(prev => prev.map(c => c.id === company.id ? { ...c, status: 'Approved' } : c));
            }
        } catch (err) {
            alert(`Failed to update company status: ${err.response?.data?.message || err.message}`);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (companyId) => {
        setActionLoading(companyId);
        try {
            await platformAdminService.deleteCompany(companyId);
            setCompanies(prev => prev.filter(c => c.id !== companyId));
            setDeleteConfirm(null);
        } catch (err) {
            alert(`Failed to delete company: ${err.response?.data?.message || err.message}`);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return (
        <div style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>
            ⏳ Loading corporate ledgers from server...
        </div>
    );

    return (
        <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 8px 0', color: 'var(--dark-text)' }}>🏢 Corporate Accounts Directory</h3>
            <p style={{ color: '#64748b', margin: '0 0 20px 0', fontSize: '14px' }}>
                Manage all registered companies on the platform. Suspend, activate, or permanently delete accounts.
            </p>

            {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '12px 16px', color: '#991b1b', marginBottom: '16px' }}>
                    ⚠️ {error}
                    <button onClick={loadCompanies} style={{ marginLeft: '12px', background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: '600' }}>
                        Retry
                    </button>
                </div>
            )}

            <div style={{ overflowX: 'auto' }}>
                <table className="tracker-table" style={{ width: '100%' }}>
                    <thead>
                        <tr>
                            <th>Company Name</th>
                            <th>Industry Sector</th>
                            <th>Corporate Email</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Administrative Control</th>
                        </tr>
                    </thead>
                    <tbody>
                        {companies.map(c => (
                            <tr key={c.id}>
                                <td><strong>{c.companyName || c.name}</strong></td>
                                <td>{c.industry || 'General Corporate'}</td>
                                <td>{c.companyEmail || c.email}</td>
                                <td>
                                    <span style={{
                                        backgroundColor: (c.status === 'Approved' || c.status === 'Active') ? '#d1fae5' : '#fee2e2',
                                        color: (c.status === 'Approved' || c.status === 'Active') ? '#065f46' : '#991b1b',
                                        padding: '4px 10px', borderRadius: '6px',
                                        fontSize: '12px', fontWeight: '700', display: 'inline-block'
                                    }}>
                                        {c.status}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                        <button
                                            onClick={() => handleToggleStatus(c)}
                                            className="auth-btn"
                                            disabled={actionLoading === c.id}
                                            style={{
                                                padding: '6px 14px', width: 'auto', fontSize: '13px', margin: 0,
                                                background: (c.status === 'Approved' || c.status === 'Active') ? '#ef4444' : 'linear-gradient(135deg, var(--blue), var(--purple))'
                                            }}
                                        >
                                            {actionLoading === c.id ? '...' : (c.status === 'Approved' || c.status === 'Active') ? '🛑 Suspend' : '✅ Activate'}
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirm(c.id)}
                                            className="auth-btn"
                                            disabled={actionLoading === c.id}
                                            style={{ padding: '6px 14px', width: 'auto', fontSize: '13px', margin: 0, background: '#64748b' }}
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {companies.length === 0 && !error && (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>
                                    No companies registered on the platform yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{
                        background: '#fff', borderRadius: '16px', padding: '28px',
                        minWidth: '360px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)'
                    }}>
                        <h4 style={{ margin: '0 0 12px 0', color: '#dc2626' }}>⚠️ Confirm Delete Company</h4>
                        <p style={{ color: '#64748b', marginBottom: '20px' }}>
                            This will permanently delete the company and all associated jobs and applications. This action <strong>cannot be undone</strong>.
                        </p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                className="auth-btn"
                                onClick={() => handleDelete(deleteConfirm)}
                                style={{ flex: 1, margin: 0, background: '#dc2626' }}
                                disabled={actionLoading !== null}
                            >
                                {actionLoading ? 'Deleting...' : '🗑️ Yes, Delete'}
                            </button>
                            <button
                                className="auth-btn"
                                onClick={() => setDeleteConfirm(null)}
                                style={{ flex: 1, margin: 0, background: '#64748b' }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Companies;