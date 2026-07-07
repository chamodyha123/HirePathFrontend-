import { useState } from "react";
import api from "../../api/axios";
import "./Auth.css";

function VerifyEmail() {
    const [form, setForm] = useState({
        email: localStorage.getItem("verifyEmail") || "",
        otp: "",
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
        setMessage("");

        try {
            const res = await api.post("/Auth/verify-email", form);
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data));
            localStorage.removeItem("verifyEmail");

            setType("success");
            setMessage("Email verified successfully.");

            setTimeout(() => {
                window.location.href = "/candidate-dashboard";
            }, 1000);
        } catch (err) {
            setType("error");
            setMessage(err.response?.data?.message || "OTP verification failed.");
        } finally {
            setLoading(false);
        }
    };

    const resend = async () => {
        try {
            await api.post("/Auth/resend-email-otp", { email: form.email });
            setType("success");
            setMessage("OTP resent successfully.");
        } catch {
            setType("error");
            setMessage("Failed to resend OTP.");
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-badge">AI Recruitment Platform</div>
                <h1>Verify Email</h1>
                <p>Enter the OTP sent to your email</p>

                {message && <div className={`message ${type}`}>{message}</div>}

                <form onSubmit={submit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input name="email" value={form.email} onChange={change} required />
                    </div>

                    <div className="form-group">
                        <label>OTP Code</label>
                        <input name="otp" value={form.otp} onChange={change} maxLength="6" required />
                    </div>

                    <button className="auth-btn" disabled={loading}>
                        {loading ? "Verifying..." : "Verify"}
                    </button>
                </form>

                <div className="auth-links">
                    <button className="auth-btn" type="button" onClick={resend}>
                        Resend OTP
                    </button>
                </div>
            </div>
        </div>
    );
}

export default VerifyEmail;