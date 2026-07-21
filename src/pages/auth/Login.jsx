import { useMemo, useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  FaArrowLeft,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaUser,
} from "react-icons/fa";

import api from "../../api/axios";
import "./Auth.css";

const portalCopy = {
  candidate: {
    eyebrow: "CANDIDATE PORTAL",
    title: "Continue your career journey",
    text:
      "Search jobs, manage your profile and track every application.",
  },

  company: {
    eyebrow: "COMPANY PORTAL",
    title: "Build your strongest team",
    text:
      "Manage jobs, candidates, interviews and recruitment workflows.",
  },

  admin: {
    eyebrow: "PLATFORM ADMIN",
    title: "Manage HirePath securely",
    text:
      "Review companies, monitor users and oversee platform operations.",
  },
};

function normalizeRoles(data) {
  let rawRoles = [];

  if (Array.isArray(data?.roles)) {
    rawRoles = data.roles;
  } else if (Array.isArray(data?.roles?.$values)) {
    rawRoles = data.roles.$values;
  } else if (data?.role) {
    rawRoles = [data.role];
  }

  return rawRoles
    .filter(Boolean)
    .map((role) => String(role).trim());
}

function getDashboard(roles = []) {
  const normalizedRoles = roles.map((role) =>
    String(role).trim().toLowerCase()
  );

  if (normalizedRoles.includes("admin")) {
    return "/platform-admin";
  }

  if (roles.includes("CompanyAdmin") || roles.includes("Recruiter")) {
    return "/recruiter-dashboard";
  }

  if (normalizedRoles.includes("hiringmanager")) {
    return "/hiring-dashboard";
  }

  if (normalizedRoles.includes("candidate")) {
    return "/candidate-dashboard";
  }

  return "/";
}

function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const portal =
    searchParams.get("portal") || "candidate";

  const content = useMemo(
    () => portalCopy[portal] || portalCopy.candidate,
    [portal]
  );

  const [form, setForm] = useState({
    emailOrUsername: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] =
    useState(false);

  const change = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setType("");

    try {
      const response = await api.post(
        "/auth/login",
        form
      );

      const data = response.data;

      if (!data?.isSuccess || !data?.token) {
        throw new Error(
          data?.message || "Login failed."
        );
      }

      const roles = normalizeRoles(data);

      if (roles.length === 0) {
        throw new Error(
          "Login succeeded, but no user role was returned."
        );
      }

      const storedUser = {
        ...data,
        roles,
      };

      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(storedUser)
      );

      localStorage.setItem(
        "roles",
        JSON.stringify(roles)
      );

      localStorage.setItem(
        "role",
        roles[0]
      );

      if (data.refreshToken) {
        localStorage.setItem(
          "refreshToken",
          data.refreshToken
        );
      }

      setType("success");
      setMessage(
        data.message || "Login successful."
      );

      navigate(
        getDashboard(roles),
        { replace: true }
      );
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("roles");
      localStorage.removeItem("role");
      localStorage.removeItem("refreshToken");

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
        <Link
          to="/"
          className="login-back"
        >
          <FaArrowLeft />
          Back to portals
        </Link>

        <div className="login-brand">
          <div className="brand-mark large">
            H
          </div>

          <div>
            <span>
              AI RECRUITMENT PLATFORM
            </span>

            <strong>HirePath</strong>
          </div>
        </div>

        <div className="login-showcase-copy">
          <span>{content.eyebrow}</span>
          <h1>{content.title}</h1>
          <p>{content.text}</p>
        </div>

        <div className="login-security">
          <FaLock />
          Secure, role-based portal access
        </div>
      </section>

      <section className="login-panel">
        <div className="login-form-wrap">
          <span className="form-eyebrow">
            WELCOME BACK
          </span>

          <h2>Sign in to HirePath</h2>

          <p className="form-intro">
            Enter your account details to continue.
          </p>

          {message && (
            <div className={`message ${type}`}>
              {message}
            </div>
          )}

          <form
            onSubmit={submit}
            className="modern-login-form"
          >
            <label htmlFor="emailOrUsername">
              Email or username
            </label>

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
              <label htmlFor="password">
                Password
              </label>

              <Link to="/forgot-password">
                Forgot password?
              </Link>
            </div>

            <div className="input-with-icon">
              <FaLock />

              <input
                id="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
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
                onClick={() =>
                  setShowPassword(
                    (value) => !value
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword
                  ? <FaEyeSlash />
                  : <FaEye />}
              </button>
            </div>

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading
                ? "Signing in..."
                : "Sign in"}
            </button>
          </form>

          <p className="signup-note">
            New candidate?{" "}
            <Link to="/register">
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

export default Login;