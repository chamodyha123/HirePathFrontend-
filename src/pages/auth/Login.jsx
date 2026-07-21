import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FaArrowLeft, FaEye, FaEyeSlash, FaLock, FaUser } from "react-icons/fa";
import api from "../../api/axios";
import "./Auth.css";

const portalCopy = {
  candidate: {
    eyebrow: "CANDIDATE PORTAL",
    title: "Continue your career journey",
    text: "Search jobs, manage your profile and track every application.",
  },
  company: {
    eyebrow: "COMPANY PORTAL",
    title: "Build your strongest team",
    text: "Manage jobs, candidates, interviews and recruitment workflows.",
  },
  admin: {
    eyebrow: "PLATFORM ADMIN",
    title: "Manage HirePath securely",
    text: "Review companies, monitor users and oversee platform operations.",
  },
};

function normalizeRoles(data) {
  const rawRoles = Array.isArray(data?.roles)
    ? data.roles
    : data?.role
      ? [data.role]
      : [];

  return rawRoles.map((role) => String(role).trim());
}

function getDashboard(roles = []) {
  if (
    roles.includes("PlatformAdmin") ||
    roles.includes("SuperAdmin") ||
    roles.includes("Admin")
  ) {
    return "/platform-admin";
  }

  if (roles.includes("CompanyAdmin")) {
    return "/company-admin";
  }

  if (roles.includes("Recruiter")) {
    return "/recruiter-dashboard";
  }

  if (roles.includes("HiringManager")) {
    return "/hiring-dashboard";
  }

  return "/candidate-dashboard";
}

function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const portal = searchParams.get("portal") || "candidate";
  const content = useMemo(() => portalCopy[portal] || portalCopy.candidate, [portal]);

  const [form, setForm] = useState({ emailOrUsername: "", password: "" });
  const [message, setMessage] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const change = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await api.post("/Auth/login", form);
      const data = response.data;

      if (!data?.isSuccess || !data?.token) {
        throw new Error(data?.message || "Login failed.");
      }

      const roles = normalizeRoles(data);
      const storedUser = { ...data, roles };

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(storedUser));
      localStorage.setItem("roles", JSON.stringify(roles));

      setType("success");
      setMessage(data.message || "Login successful.");
      navigate(getDashboard(roles), { replace: true });
    } catch (error) {
      setType("error");
      setMessage(
        error.response?.data?.message ||
        error.response?.data?.title ||
        error.message ||
        "Unable to sign in. Please check your details."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <section className="login-showcase">
        <Link to="/" className="login-back"><FaArrowLeft /> Back to portals</Link>
        <div className="login-brand">
          <div className="brand-mark large">H</div>
          <div>
            <span>AI RECRUITMENT PLATFORM</span>
            <strong>HirePath</strong>
          </div>
        </div>
        <div className="login-showcase-copy">
          <span>{content.eyebrow}</span>
          <h1>{content.title}</h1>
          <p>{content.text}</p>
        </div>
        <div className="login-security"><FaLock /> Secure, role-based portal access</div>
      </section>

      <section className="login-panel">
        <div className="login-form-wrap">
          <span className="form-eyebrow">WELCOME BACK</span>
          <h2>Sign in to HirePath</h2>
          <p className="form-intro">Enter your account details to continue.</p>

          {message && <div className={`message ${type}`}>{message}</div>}

          <form onSubmit={submit} className="modern-login-form">
            <label htmlFor="emailOrUsername">Email or username</label>
            <div className="input-with-icon">
              <FaUser />
              <input
                id="emailOrUsername"
                name="emailOrUsername"
                value={form.emailOrUsername}
                onChange={change}
                placeholder="Enter email or username"
                autoComplete="username"
                required
              />
            </div>

            <div className="password-heading">
              <label htmlFor="password">Password</label>
              <Link to="/forgot-password">Forgot password?</Link>
            </div>
            <div className="input-with-icon">
              <FaLock />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={change}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <button className="login-submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="signup-note">
            New candidate? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </section>
    </div>
  );
}

export default Login;
