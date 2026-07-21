import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import platformAdminService from "../../api/platformAdminService";

const POLL_INTERVAL_MS = 5000;

const EMPTY_STATS = {
  totalCompanies: 0,
  pendingCompanies: 0,
  approvedCompanies: 0,
  suspendedCompanies: 0,
  totalUsers: 0,
  totalJobs: 0,
  totalApplications: 0,
};

const FALLBACK_ACTIVITY = [
  {
    color: "var(--hp-violet)",
    message: "Platform administration dashboard is active",
  },
  {
    color: "var(--hp-amber)",
    message: "Company registration requests can be reviewed",
  },
  {
    color: "var(--hp-cyan)",
    message: "User accounts can be managed securely",
  },
];

function toNumber(value) {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function normalizeDashboardStats(data) {
  const source = data?.data ?? data ?? {};

  return {
    totalCompanies: toNumber(
      source.totalCompanies ??
        source.TotalCompanies ??
        source.companyCount ??
        source.CompanyCount
    ),

    pendingCompanies: toNumber(
      source.pendingCompanies ??
        source.PendingCompanies ??
        source.pendingCompanyCount ??
        source.PendingCompanyCount
    ),

    approvedCompanies: toNumber(
      source.approvedCompanies ??
        source.ApprovedCompanies ??
        source.activeCompanies ??
        source.ActiveCompanies ??
        source.approvedCompanyCount ??
        source.ApprovedCompanyCount
    ),

    suspendedCompanies: toNumber(
      source.suspendedCompanies ??
        source.SuspendedCompanies ??
        source.suspendedCompanyCount ??
        source.SuspendedCompanyCount
    ),

    totalUsers: toNumber(
      source.totalUsers ??
        source.TotalUsers ??
        source.userCount ??
        source.UserCount
    ),

    totalJobs: toNumber(
      source.totalJobs ??
        source.TotalJobs ??
        source.activeJobs ??
        source.ActiveJobs ??
        source.jobCount ??
        source.JobCount
    ),

    totalApplications: toNumber(
      source.totalApplications ??
        source.TotalApplications ??
        source.applicationCount ??
        source.ApplicationCount
    ),
  };
}

function unwrapActivity(data) {
  const values = data?.$values ?? data?.data?.$values ?? data?.data ?? data;

  if (!Array.isArray(values)) {
    return [];
  }

  return values.map((item, index) => ({
    id:
      item?.id ??
      item?.activityId ??
      `${index}-${item?.message ?? item?.description ?? "activity"}`,

    message:
      item?.message ??
      item?.description ??
      item?.title ??
      "Platform activity updated",

    color:
      item?.color ??
      getActivityColor(item?.type ?? item?.status),
  }));
}

function getActivityColor(value) {
  const normalized = String(value ?? "").toLowerCase();

  if (
    normalized.includes("approve") ||
    normalized.includes("active") ||
    normalized.includes("success")
  ) {
    return "var(--hp-green)";
  }

  if (
    normalized.includes("suspend") ||
    normalized.includes("reject") ||
    normalized.includes("error")
  ) {
    return "var(--hp-red)";
  }

  if (
    normalized.includes("pending") ||
    normalized.includes("review")
  ) {
    return "var(--hp-amber)";
  }

  if (
    normalized.includes("user") ||
    normalized.includes("account")
  ) {
    return "var(--hp-cyan)";
  }

  return "var(--hp-violet)";
}

function getErrorMessage(error) {
  if (!error) {
    return "Unable to load dashboard information.";
  }

  if (!error.response) {
    return (
      "Cannot connect to the HirePath backend. " +
      "Make sure the API is running and the HTTPS certificate is trusted."
    );
  }

  if (error.response.status === 401) {
    return "Your login session has expired. Please sign in again.";
  }

  if (error.response.status === 403) {
    return "Your account does not have Platform Admin permission.";
  }

  if (error.response.status === 404) {
    return "The Platform Admin dashboard endpoint was not found.";
  }

  return (
    error.response?.data?.message ||
    error.response?.data?.title ||
    "Unable to load dashboard information."
  );
}

// Fixed memory leak in count up animation hook
function useCountUp(target, duration = 700) {
  const safeTarget = toNumber(target);
  const [value, setValue] = useState(0);
  const previousValueRef = useRef(0);

  useEffect(() => {
    let isMounted = true;
    const fromValue = previousValueRef.current;
    const startTime = performance.now();
    let animationFrameId;

    const animate = (currentTime) => {
      if (!isMounted) return;

      const progress = Math.min(
        (currentTime - startTime) / duration,
        1
      );

      const easedProgress = 1 - Math.pow(1 - progress, 3);

      const nextValue = Math.round(
        fromValue + (safeTarget - fromValue) * easedProgress
      );

      setValue(nextValue);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        previousValueRef.current = safeTarget;
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      isMounted = false;
      cancelAnimationFrame(animationFrameId);
    };
  }, [safeTarget, duration]);

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

        <span>
          {stats.totalCompanies.toLocaleString()} companies currently registered
        </span>
      </div>

      <svg
        className="hp-pipeline-svg"
        viewBox="0 0 1000 190"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Company approval pipeline"
      >
        <defs>
          <linearGradient
            id="hp-flow-grad"
            x1="0"
            y1="0"
            x2="1"
            y2="0"
          >
            <stop
              offset="0%"
              stopColor="var(--hp-violet)"
            />
            <stop
              offset="50%"
              stopColor="var(--hp-amber)"
            />
            <stop
              offset="100%"
              stopColor="var(--hp-green)"
            />
          </linearGradient>
        </defs>

        <path
          className="hp-path-line"
          d="M 80 100 C 260 40, 380 160, 500 100 S 740 40, 920 100"
        />

        <path
          className="hp-path-flow"
          d="M 80 100 C 260 40, 380 160, 500 100 S 740 40, 920 100"
          stroke="url(#hp-flow-grad)"
        />

        <path
          className="hp-off-ramp"
          d="M 920 100 C 940 130, 930 155, 900 165"
        />

        <circle
          cx="80"
          cy="100"
          r="9"
          fill="var(--hp-bg)"
          stroke="var(--hp-violet)"
          strokeWidth="2.5"
        />

        <text
          x="80"
          y="132"
          textAnchor="middle"
          className="hp-node-label"
        >
          TOTAL
        </text>

        <text
          x="80"
          y="72"
          textAnchor="middle"
          className="hp-node-value"
          fill="var(--hp-violet)"
          fontSize="22"
        >
          {total}
        </text>

        <circle
          cx="500"
          cy="100"
          r="9"
          fill="var(--hp-bg)"
          stroke="var(--hp-amber)"
          strokeWidth="2.5"
        />

        <text
          x="500"
          y="132"
          textAnchor="middle"
          className="hp-node-label"
        >
          PENDING REVIEW
        </text>

        <text
          x="500"
          y="72"
          textAnchor="middle"
          className="hp-node-value"
          fill="var(--hp-amber)"
          fontSize="22"
        >
          {pending}
        </text>

        <circle
          cx="920"
          cy="100"
          r="9"
          fill="var(--hp-bg)"
          stroke="var(--hp-green)"
          strokeWidth="2.5"
        />

        <text
          x="920"
          y="132"
          textAnchor="middle"
          className="hp-node-label"
        >
          APPROVED
        </text>

        <text
          x="920"
          y="72"
          textAnchor="middle"
          className="hp-node-value"
          fill="var(--hp-green)"
          fontSize="22"
        >
          {approved}
        </text>

        <circle
          cx="900"
          cy="165"
          r="6.5"
          fill="var(--hp-bg)"
          stroke="var(--hp-red)"
          strokeWidth="2.2"
        />

        <text
          x="900"
          y="184"
          textAnchor="middle"
          className="hp-node-label"
          fontSize="10"
        >
          SUSPENDED · {suspended}
        </text>
      </svg>
    </div>
  );
}

function MetricTile({
  icon,
  label,
  value,
  accent,
  gradient,
}) {
  const count = useCountUp(value);

  return (
    <div
      className="hp-tile"
      style={{ "--tile-accent": accent }}
    >
      <div className="hp-tile-top">
        <div
          className="hp-tile-icon"
          style={{ background: gradient }}
        >
          {icon}
        </div>
      </div>

      <div className="hp-tile-label">{label}</div>

      <div
        className="hp-tile-value"
        style={{ color: accent }}
      >
        {count.toLocaleString()}
      </div>
    </div>
  );
}

function PlatformAdminDashboard() {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [activity, setActivity] = useState(FALLBACK_ACTIVITY);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLive, setIsLive] = useState(false);
  const [secondsAgo, setSecondsAgo] = useState(0);

  const pollingIntervalRef = useRef(null);
  const clockIntervalRef = useRef(null);
  const mountedRef = useRef(true);

  const loadDashboard = useCallback(
    async ({ showLoader = false } = {}) => {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      try {
        const dashboardData =
          await platformAdminService.getDashboardStats();

        if (!mountedRef.current) return;

        setStats(normalizeDashboardStats(dashboardData));
        setErrorMessage("");
        setIsLive(true);
        setSecondsAgo(0);
      } catch (error) {
        console.error("Platform Admin dashboard request failed:", error);

        if (!mountedRef.current) return;

        setErrorMessage(getErrorMessage(error));
        setIsLive(false);
      } finally {
        if (mountedRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }

      try {
        const activityData =
          await platformAdminService.getRecentActivity();

        if (!mountedRef.current) return;

        const normalizedActivity = unwrapActivity(activityData);

        setActivity(
          normalizedActivity.length > 0
            ? normalizedActivity
            : FALLBACK_ACTIVITY
        );
      } catch (error) {
        console.warn("Recent activity endpoint is unavailable:", error);

        if (mountedRef.current) {
          setActivity(FALLBACK_ACTIVITY);
        }
      }
    },
    []
  );

  useEffect(() => {
    mountedRef.current = true;

    // Synchronous execution cleanups prevent initial state issues
    const initialLoadTimeoutId = window.setTimeout(() => {
      void loadDashboard({ showLoader: true });
    }, 0);

    pollingIntervalRef.current = window.setInterval(() => {
      void loadDashboard();
    }, POLL_INTERVAL_MS);

    clockIntervalRef.current = window.setInterval(() => {
      setSecondsAgo((currentValue) => currentValue + 1);
    }, 1000);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (pollingIntervalRef.current !== null) {
          window.clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        return;
      }

      void loadDashboard();

      if (pollingIntervalRef.current === null) {
        pollingIntervalRef.current = window.setInterval(() => {
          void loadDashboard();
        }, POLL_INTERVAL_MS);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      mountedRef.current = false;

      window.clearTimeout(initialLoadTimeoutId);

      if (pollingIntervalRef.current !== null) {
        window.clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }

      if (clockIntervalRef.current !== null) {
        window.clearInterval(clockIntervalRef.current);
        clockIntervalRef.current = null;
      }

      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadDashboard]);

  const liveText = isLive
    ? secondsAgo < 60
      ? `Live · synced ${secondsAgo}s ago`
      : `Live · synced ${Math.floor(secondsAgo / 60)}m ago`
    : "Connection unavailable";

  if (loading) {
    return (
      <div className="hp-root">
        <HpStyles />
        <div className="hp-loading">
          <div className="hp-spinner" />
          <p>Loading Platform Admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hp-root">
      <HpStyles />

      <div className="hp-topbar">
        <div>
          <h1>Control Room</h1>
          <div className="hp-topbar-sub">
            Platform-wide oversight, refreshed automatically
          </div>
        </div>

        <div className="hp-topbar-actions">
          <div className="hp-live-badge">
            <span
              className="hp-live-dot"
              style={{
                background: isLive
                  ? "var(--hp-green)"
                  : "var(--hp-red)",
              }}
            />
            {liveText}
          </div>

          <button
            type="button"
            className="hp-refresh-button"
            onClick={() => loadDashboard()}
            disabled={refreshing}
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="hp-error-box">
          <div>
            <strong>Dashboard connection error</strong>
            <p>{errorMessage}</p>
          </div>

          <button
            type="button"
            onClick={() => loadDashboard({ showLoader: false })}
          >
            Retry
          </button>
        </div>
      )}

      <PipelineHero stats={stats} />

      <div className="hp-grid">
        <MetricTile
          label="Total Platform Accounts"
          value={stats.totalUsers}
          accent="var(--hp-cyan)"
          gradient="linear-gradient(135deg, var(--hp-cyan), #0E7CA8)"
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.8"
            >
              <circle cx="9" cy="8" r="3.2" />
              <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
              <circle cx="17.5" cy="8.5" r="2.6" />
              <path d="M15.5 14.3c2.9.4 5 2.5 5 5.7" />
            </svg>
          }
        />

        <MetricTile
          label="Active Job Postings"
          value={stats.totalJobs}
          accent="var(--hp-violet)"
          gradient="linear-gradient(135deg, var(--hp-violet), #6D28D9)"
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.8"
            >
              <rect x="3" y="7.5" width="18" height="12.5" rx="1.8" />
              <path d="M8 7.5V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1.5" />
              <path d="M3 12.5h18" />
            </svg>
          }
        />

        <MetricTile
          label="Total Applications"
          value={stats.totalApplications}
          accent="var(--hp-pink)"
          gradient="linear-gradient(135deg, var(--hp-pink), #BE185D)"
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.8"
            >
              <path d="M7 3h7l4 4v14H7z" />
              <path d="M14 3v4h4" />
              <path d="M9.5 12.5h5M9.5 16h5" />
            </svg>
          }
        />

        <MetricTile
          label="Suspended Companies"
          value={stats.suspendedCompanies}
          accent="var(--hp-red)"
          gradient="linear-gradient(135deg, var(--hp-red), #B91C1C)"
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.8"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M9 9l6 6M15 9l-6 6" />
            </svg>
          }
        />
      </div>

      <div className="hp-activity">
        <div className="hp-activity-label">Activity</div>

        <div className="hp-ticker-wrap">
          <div className="hp-ticker">
            {[...activity, ...activity].map((item, index) => (
              <span
                className="hp-tick"
                key={`${item.id ?? index}-${index}`}
              >
                <span
                  className="hp-tick-dot"
                  style={{
                    background: item.color || "var(--hp-violet)",
                  }}
                />
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
      .hp-root {
        --hp-bg: #0e1424;
        --hp-surface: #161d33;
        --hp-surface-2: #1c2540;
        --hp-border: #262f4d;
        --hp-text: #edf0f8;
        --hp-muted: #8792ac;
        --hp-violet: #8b5cf6;
        --hp-cyan: #22d3ee;
        --hp-pink: #ec4899;
        --hp-amber: #f5a623;
        --hp-green: #34d399;
        --hp-red: #ef6461;

        width: 100%;
        box-sizing: border-box;
        padding: 26px 30px 34px;
        color: var(--hp-text);
        font-family: "Inter", sans-serif;
        background:
          radial-gradient(
            circle at 12% 0%,
            rgba(139, 92, 246, 0.14),
            transparent 45%
          ),
          radial-gradient(
            circle at 88% 8%,
            rgba(34, 211, 238, 0.1),
            transparent 45%
          ),
          radial-gradient(
            circle at 85% 100%,
            rgba(236, 72, 153, 0.08),
            transparent 45%
          ),
          var(--hp-bg);
        border-radius: 16px;
      }

      .hp-loading {
        min-height: 320px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: var(--hp-text);
        text-align: center;
      }

      .hp-loading p {
        margin: 0;
      }

      .hp-spinner {
        width: 32px;
        height: 32px;
        margin: 0 auto 14px;
        border: 3px solid var(--hp-border);
        border-top-color: var(--hp-violet);
        border-radius: 50%;
        animation: hp-spin 0.8s linear infinite;
      }

      @keyframes hp-spin {
        to {
          transform: rotate(360deg);
        }
      }

      .hp-topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 14px;
        margin-bottom: 22px;
      }

      .hp-topbar h1 {
        display: inline-block;
        margin: 0;
        color: transparent;
        font-size: 22px;
        font-weight: 700;
        letter-spacing: -0.01em;
        background: linear-gradient(
          90deg,
          var(--hp-violet),
          var(--hp-cyan)
        );
        background-clip: text;
        -webkit-background-clip: text;
      }

      .hp-topbar-sub {
        margin-top: 3px;
        color: var(--hp-muted);
        font-size: 12.5px;
      }

      .hp-topbar-actions {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .hp-live-badge {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 7px 13px;
        color: var(--hp-muted);
        font-size: 12px;
        background: var(--hp-surface);
        border: 1px solid var(--hp-border);
        border-radius: 20px;
      }

      .hp-live-dot {
        width: 7px;
        height: 7px;
        flex-shrink: 0;
        border-radius: 50%;
        animation: hp-pulse 1.8s infinite;
      }

      @keyframes hp-pulse {
        0%, 100% {
          box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.55);
        }
        50% {
          box-shadow: 0 0 0 5px rgba(52, 211, 153, 0);
        }
      }

      .hp-refresh-button {
        min-width: 92px;
        padding: 8px 14px;
        color: var(--hp-text);
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        background: var(--hp-surface);
        border: 1px solid var(--hp-border);
        border-radius: 10px;
      }

      .hp-refresh-button:hover:not(:disabled) {
        border-color: var(--hp-cyan);
      }

      .hp-refresh-button:disabled {
        cursor: not-allowed;
        opacity: 0.65;
      }

      .hp-error-box {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 18px;
        margin-bottom: 20px;
        padding: 16px 18px;
        background: rgba(239, 100, 97, 0.1);
        border: 1px solid rgba(239, 100, 97, 0.45);
        border-radius: 12px;
      }

      .hp-error-box strong {
        color: var(--hp-red);
        font-size: 13px;
      }

      .hp-error-box p {
        margin: 4px 0 0;
        color: var(--hp-muted);
        font-size: 12px;
      }

      .hp-error-box button {
        flex-shrink: 0;
        padding: 8px 14px;
        color: white;
        font-weight: 600;
        cursor: pointer;
        background: var(--hp-red);
        border: 0;
        border-radius: 8px;
      }

      .hp-pipeline-card {
        margin-bottom: 20px;
        padding: 24px 26px 18px;
        background: var(--hp-surface);
        border: 1px solid var(--hp-border);
        border-radius: 18px;
      }

      .hp-pipeline-head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 4px;
      }

      .hp-pipeline-head h2 {
        margin: 0;
        font-size: 15px;
        font-weight: 600;
      }

      .hp-pipeline-head span {
        color: var(--hp-muted);
        font-size: 11.5px;
      }

      .hp-pipeline-svg {
        display: block;
        width: 100%;
        height: auto;
      }

      .hp-path-line {
        fill: none;
        stroke: var(--hp-border);
        stroke-width: 2.5;
      }

      .hp-path-flow {
        fill: none;
        opacity: 0.95;
        stroke-width: 3;
        stroke-dasharray: 9 10;
        animation: hp-flow 1.4s linear infinite;
      }

      @keyframes hp-flow {
        to {
          stroke-dashoffset: -38;
        }
      }

      .hp-off-ramp {
        fill: none;
        stroke: var(--hp-border);
        stroke-width: 2;
        stroke-dasharray: 4 5;
      }

      .hp-node-label {
        fill: var(--hp-muted);
        font-size: 11px;
        font-weight: 500;
      }

      .hp-node-value {
        font-weight: 700;
      }

      .hp-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
        gap: 14px;
        margin-bottom: 20px;
      }

      .hp-tile {
        padding: 18px 20px;
        background: var(--hp-surface);
        border: 1px solid var(--hp-border);
        border-radius: 14px;
        transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
      }

      .hp-tile:hover {
        border-color: var(--tile-accent);
        transform: translateY(-3px);
        box-shadow: 0 10px 24px -10px rgba(0, 0, 0, 0.55);
      }

      .hp-tile-top {
        margin-bottom: 14px;
      }

      .hp-tile-icon {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 9px;
        box-shadow: 0 4px 14px -4px rgba(0, 0, 0, 0.4);
      }

      .hp-tile-icon svg {
        width: 16px;
        height: 16px;
      }

      .hp-tile-label {
        margin-bottom: 5px;
        color: var(--hp-muted);
        font-size: 11.5px;
        font-weight: 500;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }

      .hp-tile-value {
        font-size: 28px;
        font-weight: 700;
        letter-spacing: -0.01em;
      }

      .hp-activity {
        display: flex;
        align-items: center;
        overflow: hidden;
        padding: 6px 4px;
        background: var(--hp-surface);
        border: 1px solid var(--hp-border);
        border-radius: 14px;
      }

      .hp-activity-label {
        flex-shrink: 0;
        padding: 8px 16px;
        color: var(--hp-muted);
        font-size: 10.5px;
        font-weight: 600;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        border-right: 1px solid var(--hp-border);
      }

      .hp-ticker-wrap {
        flex: 1;
        overflow: hidden;
      }

      .hp-ticker {
        display: flex;
        gap: 36px;
        width: max-content;
        padding: 10px 20px;
        white-space: nowrap;
        animation: hp-scroll 22s linear infinite;
      }

      @keyframes hp-scroll {
        from {
          transform: translateX(0);
        }
        to {
          transform: translateX(-50%);
        }
      }

      .hp-tick {
        display: flex;
        align-items: center;
        gap: 7px;
        color: var(--hp-muted);
        font-size: 12.5px;
      }

      .hp-tick-dot {
        width: 5px;
        height: 5px;
        flex-shrink: 0;
        border-radius: 50%;
      }

      @media (max-width: 768px) {
        .hp-root {
          padding: 20px 16px 26px;
        }

        .hp-topbar-actions {
          width: 100%;
          justify-content: space-between;
        }

        .hp-pipeline-card {
          padding: 18px 12px 12px;
          overflow-x: auto;
        }

        .hp-pipeline-svg {
          min-width: 650px;
        }

        .hp-error-box {
          align-items: flex-start;
          flex-direction: column;
        }

        .hp-activity-label {
          display: none;
        }
      }
    `}</style>
  );
}

export default PlatformAdminDashboard;