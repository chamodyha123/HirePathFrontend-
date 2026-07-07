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

    const change = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post("/Auth/reset-password", form);
            localStorage.removeItem("resetEmail");

            setType("success");
            setMessage("Password reset successfully.");

            setTimeout(() => {
                window.location.href = "/login";
            }, 1000);
        } catch (err) {
            setType("error");
            setMessage(err.response?.data?.message || "Password reset failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-badge">AI Recruitment Platform</div>
                <h1>Reset Password</h1>
                <p>Enter OTP and new password</p>

                {message && <div className={`message ${type}`}>{message}</div>}

                <form onSubmit={submit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input name="email" value={form.email} onChange={change} required />
                    </div>

                    <div className="form-group">
                        <label>OTP</label>
                        <input name="otp" value={form.otp} onChange={change} maxLength="6" required />
                    </div>

                    <div className="form-group">
                        <label>New Password</label>
                        <input type="password" name="newPassword" value={form.newPassword} onChange={change} required />
                    </div>

                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={change} required />
                    </div>

                    <button className="auth-btn" disabled={loading}>
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ResetPassword;