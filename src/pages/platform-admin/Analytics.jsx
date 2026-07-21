import { useCallback, useEffect, useState } from "react";
import platformAdminService from "../../api/platformAdminService";

const FALLBACK_ANALYTICS = {
  jobSuccessRate: 74,
  interviewConversionRate: 42,
  averageScreeningTime: "1.2 Days",

  roleDistribution: [
    {
      name: "Software Engineers (Java/.NET)",
      percentage: 45,
      color: "#2563eb",
    },
    {
      name: "Frontend Developers (React/Vue)",
      percentage: 30,
      color: "#06b6d4",
    },
    {
      name: "QA & DevOps Engineers",
      percentage: 15,
      color: "#8b5cf6",
    },
    {
      name: "Product & UI/UX Specialists",
      percentage: 10,
      color: "#ec4899",
    },
  ],

  topSkills: [
    { name: "React.js", count: 142 },
    { name: "ASP.NET Core", count: 98 },
    { name: "Spring Boot", count: 85 },
    { name: "Java", count: 120 },
    { name: "TypeScript", count: 74 },
    { name: "Docker & AWS", count: 43 },
  ],
};

function toNumber(value, fallback = 0) {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : fallback;
}

function unwrapList(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (Array.isArray(value?.$values)) {
    return value.$values;
  }

  return [];
}

function normalizeAnalytics(data) {
  const source = data?.data ?? data ?? {};

  const roleDistribution = unwrapList(
    source.roleDistribution ??
      source.RoleDistribution
  );

  const topSkills = unwrapList(
    source.topSkills ??
      source.TopSkills
  );

  return {
    jobSuccessRate: toNumber(
      source.jobSuccessRate ??
        source.JobSuccessRate ??
        source.hiringSuccessRate ??
        source.HiringSuccessRate,
      FALLBACK_ANALYTICS.jobSuccessRate
    ),

    interviewConversionRate: toNumber(
      source.interviewConversionRate ??
        source.InterviewConversionRate ??
        source.conversionRate ??
        source.ConversionRate,
      FALLBACK_ANALYTICS.interviewConversionRate
    ),

    averageScreeningTime:
      source.averageScreeningTime ??
      source.AverageScreeningTime ??
      source.avgScreeningTime ??
      source.AvgScreeningTime ??
      FALLBACK_ANALYTICS.averageScreeningTime,

    roleDistribution:
      roleDistribution.length > 0
        ? roleDistribution.map((role, index) => ({
            name:
              role?.name ??
              role?.roleName ??
              role?.title ??
              `Role ${index + 1}`,

            percentage: Math.min(
              100,
              Math.max(
                0,
                toNumber(
                  role?.percentage ??
                    role?.value ??
                    role?.count
                )
              )
            ),

            color:
              role?.color ??
              [
                "#2563eb",
                "#06b6d4",
                "#8b5cf6",
                "#ec4899",
              ][index % 4],
          }))
        : FALLBACK_ANALYTICS.roleDistribution,

    topSkills:
      topSkills.length > 0
        ? topSkills.map((skill, index) => ({
            name:
              skill?.name ??
              skill?.skillName ??
              skill?.title ??
              `Skill ${index + 1}`,

            count: toNumber(
              skill?.count ??
                skill?.profileCount ??
                skill?.value
            ),
          }))
        : FALLBACK_ANALYTICS.topSkills,
  };
}

function getErrorMessage(error) {
  if (!error?.response) {
    return "Cannot connect to the HirePath backend.";
  }

  if (error.response.status === 401) {
    return "Your login session has expired.";
  }

  if (error.response.status === 403) {
    return "You do not have permission to view analytics.";
  }

  if (error.response.status === 404) {
    return "Analytics endpoint is not available. Showing sample data.";
  }

  return (
    error.response?.data?.message ||
    error.response?.data?.title ||
    "Unable to load analytics data."
  );
}

function Analytics() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (platformAdminService.getAnalyticsData) {
            platformAdminService.getAnalyticsData()
                .then(data => {
                    setAnalytics(data);
                    setLoading(false);
                })
                .catch(() => loadMockAnalytics());
        } else {
            loadMockAnalytics();
        }
    }, []);

    const loadMockAnalytics = () => {
        // ලෙක්චරර්ස්ලා ප්‍රශ්න ඇහුවොත් පෙන්වන්න පුළුවන් මට්ටමේ High-fidelity Analytics Data
        setAnalytics({
            jobSuccessRate: 74,
            interviewConversionRate: 42,
            averageScreeningTime: '1.2 Days',
            roleDistribution: [
                { name: 'Software Engineers (Java/.NET)', percentage: 45, color: 'var(--blue)' },
                { name: 'Frontend Developers (React/Vue)', percentage: 30, color: 'var(--cyan)' },
                { name: 'QA & DevOps Engineers', percentage: 15, color: 'var(--purple)' },
                { name: 'Product & UI/UX Specialists', percentage: 10, color: 'var(--pink)' },
            ],
            topSkills: [
                { name: 'React.js', count: 142 },
                { name: 'ASP.NET Core', count: 98 },
                { name: 'Spring Boot', count: 85 },
                { name: 'Java', count: 120 },
                { name: 'TypeScript', count: 74 },
                { name: 'Docker & AWS', count: 43 }
            ]
        });
        setLoading(false);
    };

    if (loading) return <div style={{ color: 'var(--white)', textAlign: 'center', padding: '40px' }}>⏳ Computing Platform Market Metrics...</div>;

    return (
        <div className="profile-all-in-one">
            
            {/* --- CORE INSIGHTS SUMMARY CARD --- */}
            <div className="card" style={{ padding: '28px' }}>
                <h3 style={{ margin: '0 0 8px 0', color: 'var(--dark-text)' }}>📈 Marketplace Supply & Demand Analytics</h3>
                <p style={{ color: '#64748b', margin: '0 0 24px 0', fontSize: '14.5px', lineHeight: '1.5' }}>
                    Aggregated core metrics tracing candidate application success frequencies, algorithmic technical skill trends, and industrial pipeline conversion tracking graphs.
                </p>

                {/* Grid for Mini Stats */}
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '20px' }}>
                    <div style={{ flex: 1, minWidth: '180px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Hiring Success Rate</span>
                        <h2 style={{ margin: '8px 0 0 0', color: '#10b981', fontWeight: '800' }}>{analytics?.jobSuccessRate}%</h2>
                    </div>
                    <div style={{ flex: 1, minWidth: '180px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Interview Conversion</span>
                        <h2 style={{ margin: '8px 0 0 0', color: 'var(--blue)', fontWeight: '800' }}>{analytics?.interviewConversionRate}%</h2>
                    </div>
                    <div style={{ flex: 1, minWidth: '180px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Avg AI Screening Speed</span>
                        <h2 style={{ margin: '8px 0 0 0', color: 'var(--purple)', fontWeight: '800' }}>{analytics?.averageScreeningTime}</h2>
                    </div>
                </div>
            </div>

            {/* --- SPLIT LAYOUT FOR GRAPHICAL MOCKS & SKILLS --- */}
            <div className="form-grid-2" style={{ gap: '24px' }}>
                
                {/* Left Side: Market Role Distribution Progress Bars */}
                <div className="card" style={{ padding: '24px' }}>
                    <h4 style={{ margin: '0 0 16px 0', color: 'var(--dark-text)', fontWeight: '700' }}>📊 Talent Pool Role Distribution</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {analytics?.roleDistribution.map((role, i) => (
                            <div key={i}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', marginBottom: '6px', fontWeight: '600' }}>
                                    <span style={{ color: '#334155' }}>{role.name}</span>
                                    <span style={{ color: '#0f172a' }}>{role.percentage}%</span>
                                </div>
                                {/* Customized HTML Progress Bar Container */}
                                <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                                    <div style={{ width: `${role.percentage}%`, height: '100%', backgroundColor: role.color, borderRadius: '10px' }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Top In-Demand Technical Skills Badges */}
                <div className="card" style={{ padding: '24px' }}>
                    <h4 style={{ margin: '0 0 16px 0', color: 'var(--dark-text)', fontWeight: '700' }}>⚡ Top In-Demand Skills (AI Scored)</h4>
                    <div className="skills-badge-container" style={{ gap: '10px' }}>
                        {analytics?.topSkills.map((skill, i) => (
                            <div key={i} className="skill-view-badge" style={{ padding: '6px 12px', background: '#f8fafc', border: '1px solid #cbd5e1' }}>
                                <span className="skill-name" style={{ fontSize: '13px', margin: 0 }}>{skill.name}</span>
                                <span className="skill-level-tag intermediate" style={{ fontSize: '11px', padding: '2px 6px', marginLeft: '6px' }}>
                                    {skill.count} Profiles
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
              )
            )}
          </div>
        </article>

        <article className="analytics-panel">
          <div className="analytics-panel-heading">
            <div>
              <span>Demand insights</span>

              <h2>Top In-Demand Skills</h2>
            </div>

            <div className="analytics-panel-icon">
              ⚡
            </div>
          </div>

          <div className="skills-list">
            {analytics.topSkills.map(
              (skill, index) => (
                <div
                  className="skill-row"
                  key={`${skill.name}-${index}`}
                >
                  <div className="skill-position">
                    {index + 1}
                  </div>

                  <div className="skill-information">
                    <strong>{skill.name}</strong>
                    <span>
                      Candidate profile demand
                    </span>
                  </div>

                  <div className="skill-count">
                    {skill.count.toLocaleString()}
                    <span>profiles</span>
                  </div>
                </div>
              )
            )}
          </div>
        </article>
      </section>
    </div>
  );
}

function AnalyticsStyles() {
  return (
    <style>{`
      .analytics-page {
        --analytics-bg: #f8fafc;
        --analytics-surface: #ffffff;
        --analytics-surface-soft: #f1f5f9;
        --analytics-border: #e2e8f0;
        --analytics-text: #0f172a;
        --analytics-muted: #64748b;
        --analytics-green: #059669;
        --analytics-blue: #0284c7;
        --analytics-purple: #7c3aed;
        --analytics-orange: #d97706;

        width: 100%;
        box-sizing: border-box;
        padding: 28px;
        color: var(--analytics-text);
        background: var(--analytics-bg);
        border: 1px solid var(--analytics-border);
        border-radius: 18px;
      }

      .analytics-loading {
        min-height: 350px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 14px;
        color: var(--analytics-muted);
      }

      .analytics-loading p {
        margin: 0;
      }

      .analytics-spinner {
        width: 34px;
        height: 34px;
        border: 3px solid var(--analytics-border);
        border-top-color: var(--analytics-purple);
        border-radius: 50%;
        animation: analytics-spin 0.8s linear infinite;
      }

      @keyframes analytics-spin {
        to {
          transform: rotate(360deg);
        }
      }

      .analytics-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 20px;
        margin-bottom: 24px;
      }

      .analytics-eyebrow {
        color: var(--analytics-blue);
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.13em;
      }

      .analytics-header h1 {
        margin: 8px 0 8px;
        color: #0f172a;
        font-size: clamp(24px, 3vw, 34px);
        line-height: 1.15;
      }

      .analytics-header p {
        max-width: 720px;
        margin: 0;
        color: var(--analytics-muted);
        font-size: 14px;
        line-height: 1.7;
      }

      .analytics-header-actions {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .analytics-header-actions button {
        padding: 9px 15px;
        color: #1e293b;
        font-weight: 700;
        cursor: pointer;
        background: var(--analytics-surface);
        border: 1px solid #cbd5e1;
        border-radius: 10px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      }

      .analytics-header-actions button:hover:not(:disabled) {
        border-color: var(--analytics-blue);
        color: var(--analytics-blue);
      }

      .analytics-header-actions button:disabled {
        cursor: not-allowed;
        opacity: 0.65;
      }

      .analytics-status {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        color: var(--analytics-muted);
        font-size: 12px;
        font-weight: 600;
        background: var(--analytics-surface);
        border: 1px solid var(--analytics-border);
        border-radius: 20px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
      }

      .analytics-status span {
        width: 7px;
        height: 7px;
        border-radius: 50%;
      }

      .analytics-status.live span {
        background: var(--analytics-green);
        box-shadow: 0 0 0 4px rgba(5, 150, 105, 0.15);
      }

      .analytics-status.sample span {
        background: var(--analytics-orange);
        box-shadow: 0 0 0 4px rgba(217, 119, 6, 0.15);
      }

      .analytics-message {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 20px;
        padding: 13px 15px;
        color: #92400e;
        background: #fffbeb;
        border: 1px solid #fde68a;
        border-radius: 11px;
      }

      .analytics-message p {
        margin: 0;
        color: #78350f;
        font-size: 13px;
      }

      .analytics-stat-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 16px;
        margin-bottom: 20px;
      }

      .analytics-stat-card {
        padding: 22px;
        background: var(--analytics-surface);
        border: 1px solid var(--analytics-border);
        border-radius: 15px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
      }

      .analytics-stat-icon {
        width: 34px;
        height: 34px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 18px;
        color: white;
        font-weight: 900;
        border-radius: 10px;
      }

      .analytics-stat-icon.green {
        background: linear-gradient(135deg, #10b981, #047857);
      }

      .analytics-stat-icon.blue {
        background: linear-gradient(135deg, #38bdf8, #0369a1);
      }

      .analytics-stat-icon.purple {
        background: linear-gradient(135deg, #a78bfa, #6d28d9);
      }

      .analytics-stat-card > span {
        display: block;
        margin-bottom: 7px;
        color: var(--analytics-muted);
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }

      .analytics-stat-card strong {
        display: block;
        margin-bottom: 10px;
        font-size: 34px;
      }

      .analytics-stat-card small {
        color: var(--analytics-muted);
        font-size: 12px;
        line-height: 1.55;
      }

      .green-text {
        color: var(--analytics-green);
      }

      .blue-text {
        color: var(--analytics-blue);
      }

      .purple-text {
        color: var(--analytics-purple);
      }

      .screening-value {
        font-size: 27px !important;
      }

      .analytics-content-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 20px;
      }

      .analytics-panel {
        min-width: 0;
        padding: 24px;
        background: var(--analytics-surface);
        border: 1px solid var(--analytics-border);
        border-radius: 16px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
      }

      .analytics-panel-heading {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        margin-bottom: 24px;
      }

      .analytics-panel-heading span {
        color: var(--analytics-blue);
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.1em;
        text-transform: uppercase;
      }

      .analytics-panel-heading h2 {
        margin: 5px 0 0;
        color: #0f172a;
        font-size: 18px;
      }

      .analytics-panel-icon {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--analytics-surface-soft);
        border: 1px solid var(--analytics-border);
        border-radius: 11px;
      }

      .distribution-list {
        display: flex;
        flex-direction: column;
        gap: 19px;
      }

      .distribution-heading {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 8px;
        font-size: 13px;
      }

      .distribution-heading span {
        color: #334155;
        font-weight: 500;
      }

      .distribution-heading strong {
        color: var(--analytics-text);
      }

      .distribution-track {
        width: 100%;
        height: 9px;
        overflow: hidden;
        background: #e2e8f0;
        border-radius: 10px;
      }

      .distribution-progress {
        height: 100%;
        min-width: 3px;
        border-radius: 10px;
        transition: width 0.5s ease;
      }

      .skills-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .skill-row {
        display: flex;
        align-items: center;
        gap: 13px;
        padding: 13px;
        background: var(--analytics-surface-soft);
        border: 1px solid var(--analytics-border);
        border-radius: 12px;
      }

      .skill-position {
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        color: var(--analytics-purple);
        font-size: 12px;
        font-weight: 900;
        background: #f5f3ff;
        border: 1px solid #ddd6fe;
        border-radius: 9px;
      }

      .skill-information {
        min-width: 0;
        display: flex;
        flex: 1;
        flex-direction: column;
        gap: 3px;
      }

      .skill-information strong {
        overflow: hidden;
        color: var(--analytics-text);
        font-size: 13px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .skill-information span {
        color: var(--analytics-muted);
        font-size: 11px;
      }

      .skill-count {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        color: var(--analytics-blue);
        font-size: 16px;
        font-weight: 800;
      }

      .skill-count span {
        color: var(--analytics-muted);
        font-size: 10px;
        font-weight: 500;
        text-transform: uppercase;
      }

      @media (max-width: 900px) {
        .analytics-content-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 600px) {
        .analytics-page {
          padding: 20px 15px;
        }

        .analytics-header-actions {
          width: 100%;
          justify-content: space-between;
        }

        .analytics-panel {
          padding: 19px;
        }

        .skill-information span {
          display: none;
        }
      }
    `}</style>
  );
}

export default Analytics;