import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/axios";
import "./Auth.css";

export default function AcceptInvitation() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = useMemo(() => params.get("token")?.trim() || "", [params]);
  const [invite, setInvite] = useState(null);
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const validate = async () => {
      if (!token) {
        setError("Invitation token is missing.");
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get("/company-onboarding/invitations/validate", { params: { token } });
        setInvite(data);
        const suggested = (data.email || "").split("@")[0].replace(/[^a-zA-Z0-9._-]/g, "");
        setUserName(suggested);
      } catch (err) {
        setError(err.response?.data?.message || err.response?.data || "This invitation is invalid or expired.");
      } finally {
        setLoading(false);
      }
    };
    validate();
  }, [token]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!userName.trim()) return setError("Username is required.");
    if (password.length < 6) return setError("Password must contain at least 6 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    setSubmitting(true);
    try {
      const { data } = await api.post("/company-onboarding/invitations/accept", {
        token,
        userName: userName.trim(),
        password,
        confirmPassword,
      });
      setSuccess(data.message || "Account activated successfully.");
      setTimeout(() => navigate("/login", { replace: true }), 1800);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || "Unable to activate this account.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <h1>Accept HirePath Invitation</h1>
        <p className="auth-subtitle">Create your secure account to join the company recruitment team.</p>
        {loading && <p>Checking invitation...</p>}
        {error && <div className="auth-error">{String(error)}</div>}
        {success && <div className="auth-success">{success} Redirecting to login...</div>}
        {!loading && invite && !success && (
          <form onSubmit={submit}>
            <div style={{ background: "#f8fafc", padding: 14, borderRadius: 10, marginBottom: 18 }}>
              <strong>{invite.fullName}</strong><br />
              <span>{invite.email}</span><br />
              <span>{invite.role} · {invite.companyName}</span>
            </div>
            <label>Username</label>
            <input value={userName} onChange={(e) => setUserName(e.target.value)} autoComplete="username" required />
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required />
            <label>Confirm password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" required />
            <button type="submit" disabled={submitting}>{submitting ? "Activating..." : "Activate Account"}</button>
          </form>
        )}
        <p style={{ marginTop: 18 }}><Link to="/login">Back to login</Link></p>
      </div>
    </div>
  );
}
