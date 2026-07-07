import { useState } from "react";
import api from "../../api/axios";
import "./Auth.css";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [type, setType] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post("/Auth/forgot-password", { email });
            localStorage.setItem("resetEmail", email);

            setType("success");
            setMessage("Password reset OTP sent.");

            setTimeout(() => {
                window.location.href = "/reset-password";
            }, 1000);
        } catch (err) {
            setType("error");
            setMessage(err.response?.data?.message || "Failed to send OTP.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-badge">AI Recruitment Platform</div>
                <h1>Forgot Password</h1>
                <p>Enter your email to receive reset OTP</p>

                {message && <div className={`message ${type}`}>{message}</div>}

                <form onSubmit={submit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>

                    <button className="auth-btn" disabled={loading}>
                        {loading ? "Sending..." : "Send OTP"}
                    </button>
                </form>

                <div className="auth-links">
                    <a href="/login">Back to Login</a>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;