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
  const [analytics, setAnalytics] = useState(
    FALLBACK_ANALYTICS
  );

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

  const [isLiveData, setIsLiveData] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const loadAnalytics = useCallback(
    async ({ showLoader = false } = {}) => {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setMessage("");

      try {
        const data =
          await platformAdminService.getAnalyticsData();

        if (!data) {
          setAnalytics(FALLBACK_ANALYTICS);
          setIsLiveData(false);
          setMessage(
            "Analytics endpoint is not available. Showing sample data."
          );

          return;
        }

        setAnalytics(normalizeAnalytics(data));
        setIsLiveData(true);
      } catch (error) {
        console.error(
          "Analytics request failed:",
          error
        );

        setAnalytics(FALLBACK_ANALYTICS);
        setIsLiveData(false);
        setMessage(getErrorMessage(error));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadAnalytics({ showLoader: true });
  }, [loadAnalytics]);

  if (loading) {
    return (
      <div className="analytics-page">
        <AnalyticsStyles />

        <div className="analytics-loading">
          <div className="analytics-spinner" />

          <p>
            Computing Platform Market Metrics...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <AnalyticsStyles />

      <div className="analytics-header">
        <div>
          <span className="analytics-eyebrow">
            PLATFORM INTELLIGENCE
          </span>

          <h1>
            Marketplace Supply & Demand Analytics
          </h1>

          <p>
            Monitor hiring performance, technical
            skill demand and recruitment pipeline
            efficiency across HirePath.
          </p>
        </div>

        <div className="analytics-header-actions">
          <span
            className={`analytics-status ${
              isLiveData ? "live" : "sample"
            }`}
          >
            <span />

            {isLiveData
              ? "Live backend data"
              : "Sample analytics data"}
          </span>

          <button
            type="button"
            onClick={() => loadAnalytics()}
            disabled={refreshing}
          >
            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>
      </div>

      {message && (
        <div className="analytics-message">
          <span>ℹ️</span>
          <p>{message}</p>
        </div>
      )}

      <section className="analytics-stat-grid">
        <article className="analytics-stat-card">
          <div className="analytics-stat-icon green">
            ✓
          </div>

          <span>Hiring Success Rate</span>

          <strong className="green-text">
            {analytics.jobSuccessRate}%
          </strong>

          <small>
            Successful hires compared with completed
            recruitment processes
          </small>
        </article>

        <article className="analytics-stat-card">
          <div className="analytics-stat-icon blue">
            ↗
          </div>

          <span>Interview Conversion</span>

          <strong className="blue-text">
            {analytics.interviewConversionRate}%
          </strong>

          <small>
            Shortlisted candidates progressing to
            interview stages
          </small>
        </article>

        <article className="analytics-stat-card">
          <div className="analytics-stat-icon purple">
            ⚡
          </div>

          <span>Average AI Screening Speed</span>

          <strong className="purple-text screening-value">
            {analytics.averageScreeningTime}
          </strong>

          <small>
            Average time required to screen candidate
            applications
          </small>
        </article>
      </section>

      <section className="analytics-content-grid">
        <article className="analytics-panel">
          <div className="analytics-panel-heading">
            <div>
              <span>Talent insights</span>

              <h2>Talent Pool Role Distribution</h2>
            </div>

            <div className="analytics-panel-icon">
              📊
            </div>
          </div>

          <div className="distribution-list">
            {analytics.roleDistribution.map(
              (role, index) => (
                <div
                  className="distribution-item"
                  key={`${role.name}-${index}`}
                >
                  <div className="distribution-heading">
                    <span>{role.name}</span>

                    <strong>
                      {role.percentage}%
                    </strong>
                  </div>

                  <div className="distribution-track">
                    <div
                      className="distribution-progress"
                      style={{
                        width: `${role.percentage}%`,
                        backgroundColor: role.color,
                      }}
                    />
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
        --analytics-bg: #0e1424;
        --analytics-surface: #161d33;
        --analytics-surface-soft: #1c2540;
        --analytics-border: #293452;
        --analytics-text: #edf2ff;
        --analytics-muted: #8d99b3;
        --analytics-green: #34d399;
        --analytics-blue: #38bdf8;
        --analytics-purple: #a78bfa;
        --analytics-orange: #f59e0b;

        width: 100%;
        box-sizing: border-box;
        padding: 28px;
        color: var(--analytics-text);
        background:
          radial-gradient(
            circle at top left,
            rgba(56, 189, 248, 0.09),
            transparent 36%
          ),
          radial-gradient(
            circle at top right,
            rgba(167, 139, 250, 0.11),
            transparent 40%
          ),
          var(--analytics-bg);
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
        color: var(--analytics-text);
        font-weight: 700;
        cursor: pointer;
        background: var(--analytics-surface);
        border: 1px solid var(--analytics-border);
        border-radius: 10px;
      }

      .analytics-header-actions button:hover:not(:disabled) {
        border-color: var(--analytics-blue);
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
        background: var(--analytics-surface);
        border: 1px solid var(--analytics-border);
        border-radius: 20px;
      }

      .analytics-status span {
        width: 7px;
        height: 7px;
        border-radius: 50%;
      }

      .analytics-status.live span {
        background: var(--analytics-green);
        box-shadow: 0 0 0 4px
          rgba(52, 211, 153, 0.12);
      }

      .analytics-status.sample span {
        background: var(--analytics-orange);
        box-shadow: 0 0 0 4px
          rgba(245, 158, 11, 0.12);
      }

      .analytics-message {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 20px;
        padding: 13px 15px;
        color: #fcd34d;
        background: rgba(245, 158, 11, 0.08);
        border: 1px solid
          rgba(245, 158, 11, 0.32);
        border-radius: 11px;
      }

      .analytics-message p {
        margin: 0;
        color: #d8c69f;
        font-size: 13px;
      }

      .analytics-stat-grid {
        display: grid;
        grid-template-columns:
          repeat(auto-fit, minmax(220px, 1fr));
        gap: 16px;
        margin-bottom: 20px;
      }

      .analytics-stat-card {
        padding: 22px;
        background: linear-gradient(
          145deg,
          var(--analytics-surface),
          var(--analytics-surface-soft)
        );
        border: 1px solid var(--analytics-border);
        border-radius: 15px;
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
        background: linear-gradient(
          135deg,
          #10b981,
          #047857
        );
      }

      .analytics-stat-icon.blue {
        background: linear-gradient(
          135deg,
          #38bdf8,
          #0369a1
        );
      }

      .analytics-stat-icon.purple {
        background: linear-gradient(
          135deg,
          #a78bfa,
          #6d28d9
        );
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
        grid-template-columns:
          repeat(2, minmax(0, 1fr));
        gap: 20px;
      }

      .analytics-panel {
        min-width: 0;
        padding: 24px;
        background: var(--analytics-surface);
        border: 1px solid var(--analytics-border);
        border-radius: 16px;
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
        color: #cbd5e1;
      }

      .distribution-heading strong {
        color: var(--analytics-text);
      }

      .distribution-track {
        width: 100%;
        height: 9px;
        overflow: hidden;
        background: #252f49;
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
        background: rgba(167, 139, 250, 0.1);
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