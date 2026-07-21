import { useState } from "react";
import api from "../../api/axios";
import "./Auth.css";

function ResetPassword() {
    const [form, setForm] = useState({
        email: localStorage.getItem("resetEmail") || "",
        otp: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [message, setMessage] = useState("");
    const [type, setType] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);

    const change = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const getErrorMessage = (err, fallback) =>
        err.response?.data?.message ||
        err.response?.data?.title ||
        fallback;

    const submit = async (e) => {
        e.preventDefault();
        setMessage("");

        if (!/^\d{6}$/.test(form.otp.trim())) {
            setType("error");
            setMessage("Enter the 6-digit OTP sent to your email.");
            return;
        }

        if (form.newPassword !== form.confirmPassword) {
            setType("error");
            setMessage("New password and confirmation password do not match.");
            return;
        }

        setLoading(true);

        try {
            await api.post("/Auth/reset-password", {
                email: form.email.trim(),
                otp: form.otp.trim(),
                newPassword: form.newPassword,
                confirmPassword: form.confirmPassword,
            });

            localStorage.removeItem("resetEmail");
            setType("success");
            setMessage("Password reset successfully. Redirecting to login...");

            setTimeout(() => {
                window.location.href = "/login";
            }, 1200);
        } catch (err) {
            setType("error");
            setMessage(getErrorMessage(err, "Password reset failed."));
        } finally {
            setLoading(false);
        }
    };

    const resendOtp = async () => {
        if (!form.email.trim()) {
            setType("error");
            setMessage("Enter your email address first.");
            return;
        }

        setResending(true);
        setMessage("");

        try {
            await api.post("/Auth/resend-password-otp", {
                email: form.email.trim(),
            });
            localStorage.setItem("resetEmail", form.email.trim());
            setType("success");
            setMessage("A new password reset OTP was sent to your email.");
        } catch (err) {
            setType("error");
            setMessage(getErrorMessage(err, "Failed to resend the reset OTP."));
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-badge">AI Recruitment Platform</div>
                <h1>Reset Password</h1>
                <p>Enter the OTP and your new password</p>

                {message && <div className={`message ${type}`}>{message}</div>}

                <form onSubmit={submit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={change}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>OTP</label>
                        <input
                            name="otp"
                            inputMode="numeric"
                            pattern="[0-9]{6}"
                            value={form.otp}
                            onChange={change}
                            maxLength="6"
                            placeholder="Enter 6-digit code"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            name="newPassword"
                            value={form.newPassword}
                            onChange={change}
                            minLength="6"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={change}
                            minLength="6"
                            required
                        />
                    </div>

                    <button className="auth-btn" disabled={loading || resending}>
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>
                </form>

                <div className="auth-links">
                    <button
                        className="link-btn"
                        type="button"
                        onClick={resendOtp}
                        disabled={loading || resending}
                    >
                        {resending ? "Sending..." : "Resend reset OTP"}
                    </button>
                    <br />
                    <a href="/forgot-password">Use another email</a>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;
