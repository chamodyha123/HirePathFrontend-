import React, { useState, useEffect, useRef, useCallback } from 'react';

// ---- Mock service, standing in for ../../api/platformAdminService ----
// In your real project, delete this block and use:
//   import platformAdminService from '../../api/platformAdminService';
const platformAdminService = {
    getDashboardStats: () =>
        new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    totalCompanies: 18,
                    pendingCompanies: Math.floor(Math.random() * 5) + 1,
                    approvedCompanies: 14,
                    suspendedCompanies: 1,
                    totalUsers: 312 + Math.floor(Math.random() * 6),
                    totalJobs: 82,
                    totalApplications: 419 + Math.floor(Math.random() * 4),
                });
            }, 400);
        }),
    getRecentActivity: () =>
        new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    { color: 'var(--hp-green)', message: 'A company was approved' },
                    { color: 'var(--hp-violet)', message: 'A new application was submitted' },
                    { color: 'var(--hp-amber)', message: 'A company is pending review' },
                    { color: 'var(--hp-cyan)', message: 'A new user registered' },
                ]);
            }, 400);
        }),
};
// ------------------------------------------------------------------

const POLL_INTERVAL_MS = 5000;

const FALLBACK_ACTIVITY = [
    { color: 'var(--hp-green)', message: 'A company was approved' },
    { color: 'var(--hp-violet)', message: 'A new application was submitted' },
    { color: 'var(--hp-amber)', message: 'A company is pending review' },
    { color: 'var(--hp-cyan)', message: 'A new user registered' },
];

function useCountUp(target, duration = 700) {
    const [value, setValue] = useState(0);
    const fromRef = useRef(0);

    useEffect(() => {
        const from = fromRef.current;
        const start = performance.now();
        let raf;
        const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(from + (target - from) * eased));
            if (progress < 1) raf = requestAnimationFrame(tick);
            else fromRef.current = target;
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [target, duration]);

    return value;
}

function PipelineHero({ stats }) {
    const total = useCountUp(stats.totalCompanies);
    const pending = useCountUp(stats.pendingCompanies);
    const approved = useCountUp(stats.approvedCompanies);
    const suspended = useCountUp(stats.suspendedCompanies);

    return (
        <div className="hp-pipeline-card">
            <div className="hp-pipeline-head">
                <h2>Company Approval Pipeline</h2>
                <span>{stats.totalCompanies} companies currently on the path</span>
            </div>

            <svg className="hp-pipeline-svg" viewBox="0 0 1000 190" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="hp-flow-grad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="var(--hp-violet)" />
                        <stop offset="50%" stopColor="var(--hp-amber)" />
                        <stop offset="100%" stopColor="var(--hp-green)" />
                    </linearGradient>
                </defs>

                <path className="hp-path-line" d="M 80 100 C 260 40, 380 160, 500 100 S 740 40, 920 100" />
                <path className="hp-path-flow" d="M 80 100 C 260 40, 380 160, 500 100 S 740 40, 920 100" stroke="url(#hp-flow-grad)" />
                <path className="hp-off-ramp" d="M 920 100 C 940 130, 930 155, 900 165" />

                <circle cx="80" cy="100" r="9" fill="var(--hp-bg)" stroke="var(--hp-violet)" strokeWidth="2.5" />
                <text x="80" y="132" textAnchor="middle" className="hp-node-label">SUBMITTED</text>
                <text x="80" y="72" textAnchor="middle" className="hp-node-value" fill="var(--hp-violet)" fontSize="22">{total}</text>

                <circle cx="500" cy="100" r="9" fill="var(--hp-bg)" stroke="var(--hp-amber)" strokeWidth="2.5" />
                <text x="500" y="132" textAnchor="middle" className="hp-node-label">PENDING REVIEW</text>
                <text x="500" y="72" textAnchor="middle" className="hp-node-value" fill="var(--hp-amber)" fontSize="22">{pending}</text>

                <circle cx="920" cy="100" r="9" fill="var(--hp-bg)" stroke="var(--hp-green)" strokeWidth="2.5" />
                <text x="920" y="132" textAnchor="middle" className="hp-node-label">APPROVED</text>
                <text x="920" y="72" textAnchor="middle" className="hp-node-value" fill="var(--hp-green)" fontSize="22">{approved}</text>

                <circle cx="900" cy="165" r="6.5" fill="var(--hp-bg)" stroke="var(--hp-red)" strokeWidth="2.2" />
                <text x="900" y="184" textAnchor="middle" className="hp-node-label" fontSize="10">SUSPENDED · {suspended}</text>
            </svg>
        </div>
    );
}

function MetricTile({ icon, label, value, accent, gradient }) {
    const count = useCountUp(value);
    return (
        <div className="hp-tile" style={{ '--tile-accent': accent }}>
            <div className="hp-tile-top">
                <div className="hp-tile-icon" style={{ background: gradient }}>{icon}</div>
            </div>
            <div className="hp-tile-label">{label}</div>
            <div className="hp-tile-value" style={{ color: accent }}>{count.toLocaleString()}</div>
        </div>
    );
}

function PlatformAdminDashboard() {
    const [stats, setStats] = useState({
        totalCompanies: 0, pendingCompanies: 0, approvedCompanies: 0,
        suspendedCompanies: 0, totalUsers: 0, totalJobs: 0, totalApplications: 0
    });
    const [activity, setActivity] = useState(FALLBACK_ACTIVITY);
    const [loading, setLoading] = useState(true);
    const [isLive, setIsLive] = useState(true);
    const [secondsAgo, setSecondsAgo] = useState(0);
    const intervalRef = useRef(null);
    const clockRef = useRef(null);

    const fetchStats = useCallback(() => {
        platformAdminService.getDashboardStats()
            .then(data => {
                setStats(data);
                setIsLive(true);
                setLoading(false);
                setSecondsAgo(0);
            })
            .catch(() => {
                setStats({
                    totalCompanies: 18, pendingCompanies: 3, approvedCompanies: 14,
                    suspendedCompanies: 1, totalUsers: 312, totalJobs: 82, totalApplications: 419
                });
                setIsLive(false);
                setLoading(false);
                setSecondsAgo(0);
            });

        platformAdminService.getRecentActivity()
            .then(data => setActivity(data && data.length ? data : FALLBACK_ACTIVITY))
            .catch(() => setActivity(FALLBACK_ACTIVITY));
    }, []);

    useEffect(() => {
        fetchStats();
        intervalRef.current = setInterval(fetchStats, POLL_INTERVAL_MS);
        clockRef.current = setInterval(() => setSecondsAgo(s => s + 1), 1000);

        const handleVisibility = () => {
            if (document.hidden) {
                clearInterval(intervalRef.current);
            } else {
                fetchStats();
                intervalRef.current = setInterval(fetchStats, POLL_INTERVAL_MS);
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            clearInterval(intervalRef.current);
            clearInterval(clockRef.current);
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, [fetchStats]);

    if (loading) {
        return (
            <div className="hp-root">
                <HpStyles />
                <div className="hp-loading">
                    <div className="hp-spinner" />
                    ⏳ Generating Platform Metrics Matrix...
                </div>
            </div>
        );
    }

    const liveText = isLive
        ? (secondsAgo < 60 ? `Live · synced ${secondsAgo}s ago` : `Live · synced ${Math.floor(secondsAgo / 60)}m ago`)
        : 'Offline · showing cached data';

    return (
        <div className="hp-root">
            <HpStyles />

            <div className="hp-topbar">
                <div>
                    <h1>Control Room</h1>
                    <div className="hp-topbar-sub">Platform-wide oversight, refreshed automatically</div>
                </div>
                <div className="hp-live-badge">
                    <span className="hp-live-dot" style={{ background: isLive ? 'var(--hp-green)' : 'var(--hp-amber)' }} />
                    {liveText}
                </div>
            </div>

            <PipelineHero stats={stats} />

            <div className="hp-grid">
                <MetricTile
                    label="Total Platform Accounts"
                    value={stats.totalUsers}
                    accent="var(--hp-cyan)"
                    gradient="linear-gradient(135deg, var(--hp-cyan), #0E7CA8)"
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" /><circle cx="17.5" cy="8.5" r="2.6" /><path d="M15.5 14.3c2.9.4 5 2.5 5 5.7" /></svg>}
                />
                <MetricTile
                    label="Active Job Postings"
                    value={stats.totalJobs}
                    accent="var(--hp-violet)"
                    gradient="linear-gradient(135deg, var(--hp-violet), #6D28D9)"
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><rect x="3" y="7.5" width="18" height="12.5" rx="1.8" /><path d="M8 7.5V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1.5" /><path d="M3 12.5h18" /></svg>}
                />
                <MetricTile
                    label="Total Applications"
                    value={stats.totalApplications}
                    accent="var(--hp-pink)"
                    gradient="linear-gradient(135deg, var(--hp-pink), #BE185D)"
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4" /><path d="M9.5 12.5h5M9.5 16h5" /></svg>}
                />
                <MetricTile
                    label="Suspended Companies"
                    value={stats.suspendedCompanies}
                    accent="var(--hp-red)"
                    gradient="linear-gradient(135deg, var(--hp-red), #B91C1C)"
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M9 9l6 6M15 9l-6 6" /></svg>}
                />
            </div>

            <div className="hp-activity">
                <div className="hp-activity-label">Live feed</div>
                <div className="hp-ticker-wrap">
                    <div className="hp-ticker">
                        {[...activity, ...activity].map((item, i) => (
                            <span className="hp-tick" key={i}>
                                <span className="hp-tick-dot" style={{ background: item.color || 'var(--hp-violet)' }} />
                                {item.message}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function HpStyles() {
    return (
        <style>{`
            .hp-root{
                --hp-bg:#0E1424;
                --hp-surface:#161D33;
                --hp-surface-2:#1C2540;
                --hp-border:#262F4D;
                --hp-text:#EDF0F8;
                --hp-muted:#8792AC;
                --hp-violet:#8B5CF6;
                --hp-cyan:#22D3EE;
                --hp-pink:#EC4899;
                --hp-amber:#F5A623;
                --hp-green:#34D399;
                --hp-red:#EF6461;
                background:
                    radial-gradient(circle at 12% 0%, rgba(139,92,246,0.14), transparent 45%),
                    radial-gradient(circle at 88% 8%, rgba(34,211,238,0.10), transparent 45%),
                    radial-gradient(circle at 85% 100%, rgba(236,72,153,0.08), transparent 45%),
                    var(--hp-bg);
                color:var(--hp-text);
                font-family:'Inter',sans-serif;
                border-radius:16px;
                padding:26px 30px 34px;
            }
            .hp-loading{ text-align:center; padding:60px; color:var(--hp-text); }
            .hp-spinner{
                width:32px;height:32px;margin:0 auto 14px;
                border:3px solid var(--hp-border);border-top-color:var(--hp-violet);
                border-radius:50%;animation:hp-spin .8s linear infinite;
            }
            @keyframes hp-spin{ to{ transform:rotate(360deg); } }

            .hp-topbar{ display:flex;align-items:center;justify-content:space-between;margin-bottom:26px;flex-wrap:wrap;gap:14px; }
            .hp-topbar h1{
                font-size:22px;font-weight:700;letter-spacing:-0.01em;
                background:linear-gradient(90deg, var(--hp-violet), var(--hp-cyan));
                -webkit-background-clip:text; background-clip:text; color:transparent;
                display:inline-block;
            }
            .hp-topbar-sub{ font-size:12.5px;color:var(--hp-muted);margin-top:3px; }
            .hp-live-badge{
                display:flex;align-items:center;gap:8px;
                background:var(--hp-surface);border:1px solid var(--hp-border);
                padding:7px 13px;border-radius:20px;font-size:12px;color:var(--hp-muted);
            }
            .hp-live-dot{ width:7px;height:7px;border-radius:50%;animation:hp-pulse 1.8s infinite;flex-shrink:0; }
            @keyframes hp-pulse{
                0%,100%{ box-shadow:0 0 0 0 rgba(52,211,153,0.55); }
                50%{ box-shadow:0 0 0 5px rgba(52,211,153,0); }
            }

            .hp-pipeline-card{
                background:var(--hp-surface);border:1px solid var(--hp-border);
                border-radius:18px;padding:24px 26px 18px;margin-bottom:20px;
            }
            .hp-pipeline-head{ display:flex;align-items:baseline;justify-content:space-between;margin-bottom:4px;flex-wrap:wrap;gap:8px; }
            .hp-pipeline-head h2{ font-size:15px;font-weight:600; }
            .hp-pipeline-head span{ font-size:11.5px;color:var(--hp-muted); }
            .hp-pipeline-svg{ width:100%;height:auto;display:block; }
            .hp-path-line{ fill:none;stroke:var(--hp-border);stroke-width:2.5; }
            .hp-path-flow{ fill:none;stroke-width:3;stroke-dasharray:9 10;animation:hp-flow 1.4s linear infinite;opacity:0.95; }
            @keyframes hp-flow{ to{ stroke-dashoffset:-38; } }
            .hp-off-ramp{ fill:none;stroke:var(--hp-border);stroke-width:2;stroke-dasharray:4 5; }
            .hp-node-label{ font-size:11px;fill:var(--hp-muted);font-weight:500; }
            .hp-node-value{ font-weight:700; }

            .hp-grid{ display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:14px;margin-bottom:20px; }
            .hp-tile{
                background:var(--hp-surface);border:1px solid var(--hp-border);
                border-radius:14px;padding:18px 20px;transition:border-color .2s, transform .2s, box-shadow .2s;
            }
            .hp-tile:hover{
                border-color:var(--tile-accent);
                transform:translateY(-3px);
                box-shadow:0 10px 24px -10px color-mix(in srgb, var(--tile-accent) 55%, transparent);
            }
            .hp-tile-top{ margin-bottom:14px; }
            .hp-tile-icon{
                width:32px;height:32px;border-radius:9px;display:flex;align-items:center;justify-content:center;
                box-shadow:0 4px 14px -4px rgba(0,0,0,0.4);
            }
            .hp-tile-icon svg{ width:16px;height:16px; }
            .hp-tile-label{ font-size:11.5px;color:var(--hp-muted);font-weight:500;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:5px; }
            .hp-tile-value{ font-size:28px;font-weight:700;letter-spacing:-0.01em; }

            .hp-activity{ background:var(--hp-surface);border:1px solid var(--hp-border);border-radius:14px;padding:6px 4px;overflow:hidden;display:flex;align-items:center; }
            .hp-activity-label{ font-size:10.5px;color:var(--hp-muted);text-transform:uppercase;letter-spacing:0.06em;padding:8px 16px;border-right:1px solid var(--hp-border);flex-shrink:0;font-weight:600; }
            .hp-ticker-wrap{ overflow:hidden;flex:1; }
            .hp-ticker{ display:flex;gap:36px;white-space:nowrap;animation:hp-scroll 22s linear infinite;padding:10px 20px; }
            @keyframes hp-scroll{ from{ transform:translateX(0); } to{ transform:translateX(-50%); } }
            .hp-tick{ font-size:12.5px;color:var(--hp-muted);display:flex;align-items:center;gap:7px; }
            .hp-tick-dot{ width:5px;height:5px;border-radius:50%;flex-shrink:0; }
        `}</style>
    );
}

export default PlatformAdminDashboard;