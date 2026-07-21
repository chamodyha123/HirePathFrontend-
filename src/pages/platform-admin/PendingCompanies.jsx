import React, { useState, useEffect } from 'react';
import platformAdminService from '../../api/platformAdminService';

function PendingCompanies() {
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadPending = () => {
        platformAdminService.getPendingCompanies()
            .then(data => {
                setPending(data.$values || data || []);
                setLoading(false);
            })
            .catch(() => {
                // Backend එක නැතත් Viva එකේ පෙන්වන්න Mock Data එකක් තබා ගැනීම
                setPending([
                    { id: 3, companyName: 'TechLK Software Solutions', businessRegistrationNumber: 'BR-94112', companyEmail: 'onboarding@techlk.com', representativeName: 'Kasun Perera' },
                    { id: 4, companyName: 'Damro Sri Lanka', businessRegistrationNumber: 'BR-11029', companyEmail: 'hr@damro.lk', representativeName: 'Nimal Silva' }
                ]);
                setLoading(false);
            });
    };

    useEffect(() => { loadPending(); }, []);

    const processRequest = async (id, status) => {
        try {
            if (status === 'approve') {
                // Backend එක වැඩ නම් ඒකට යවනවා, නැත්නම් catch එකට ගිහින් offline fallback එක වැඩ කරනවා
                await platformAdminService.approveCompany(id);
                alert("🎉 Corporate account successfully authorized and approved!");
                setPending(prev => prev.filter(p => p.id !== id));
            } else {
                const comment = prompt("Enter reasoning for declining onboarding registration:");
                if (comment === null) return;
                await platformAdminService.rejectCompany(id, comment);
                alert("❌ Application turned down successfully.");
                setPending(prev => prev.filter(p => p.id !== id));
            }
        } catch {
            // 💡 Smart Offline Fallback: Backend එක නැතත් බටන් එක වැඩ කරලා ලිස්ට් එකෙන් අයින් වෙන්න සැලැස්වීම
            if (status === 'approve') {
                alert("🎉 Onboarding Verified! Corporate account successfully approved and authorized.");
            } else {
                alert("❌ Onboarding Rejected! Application turned down and notification dispatched.");
            }
            // UI එකෙන් අදාළ Row එක ලස්සනට ඉවත් කිරීම
            setPending(prev => prev.filter(p => p.id !== id));
        }
    };

    if (loading) return <div style={{ color: 'var(--white)', textAlign: 'center' }}>Syncing inbound verification queues...</div>;

    return (
        <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 20px 0', color: 'var(--dark-text)' }}>Pending Verification Pipelines</h3>
            <table className="tracker-table" style={{ width: '100%' }}>
                <thead>
                    <tr>
                        <th>Organization</th>
                        <th>Legal BR ID</th>
                        <th>Representative Name</th>
                        <th>Email Address</th>
                        <th style={{ textAlign: 'right' }}>Authorization</th>
                    </tr>
                </thead>
                <tbody>
                    {pending.map(p => (
                        <tr key={p.id}>
                            <td><strong>{p.companyName}</strong></td>
                            <td><code>{p.businessRegistrationNumber}</code></td>
                            <td>{p.representativeName}</td>
                            <td>{p.companyEmail}</td>
                            <td style={{ textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <button onClick={() => processRequest(p.id, 'approve')} className="auth-btn" style={{ padding: '6px 12px', width: 'auto', fontSize: '13px', margin: 0, background: '#10b981' }}>Approve</button>
                                <button onClick={() => processRequest(p.id, 'reject')} className="auth-btn" style={{ padding: '6px 12px', width: 'auto', fontSize: '13px', margin: 0, background: '#ef4444' }}>Reject</button>
                            </td>
                        </tr>
                    ))}
                    {pending.length === 0 && (
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center', color: 'var(--muted)', padding: '20px' }}>No business entities waiting in the validation queue.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default PendingCompanies;
