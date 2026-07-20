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
            // ✅ Use /api/Auth/verify-email
            const res = await api.post("/api/Auth/verify-email", form);
            
            console.log("Verify response:", res.data);

            if (res.data.isSuccess) {
                localStorage.setItem("token", res.data.token);
                localStorage.setItem("user", JSON.stringify(res.data));
                localStorage.removeItem("verifyEmail");

                setType("success");
                setMessage("Email verified successfully.");

                setTimeout(() => {
                    window.location.href = "/candidate-dashboard";
                }, 2000);
            } else {
                setType("error");
                setMessage(res.data.message || "OTP verification failed.");
            }
        } catch (err) {
            console.error("Verification error:", err);
            setType("error");
            setMessage(
                err.response?.data?.message ||
                err.response?.data?.title ||
                "OTP verification failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const resend = async () => {
        try {
            // ✅ Use /api/Auth/resend-email-otp
            await api.post("/api/Auth/resend-email-otp", { email: form.email });
            setType("success");
            setMessage("OTP resent successfully. Please check your email.");
        } catch (err) {
            console.error("Resend error:", err);
            setType("error");
            setMessage(
                err.response?.data?.message ||
                "Failed to resend OTP. Please try again."
            );
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-badge">
                    AI Recruitment Platform
                </div>

                <h1>Verify Email</h1>
                <p>
                    Enter the 6-digit OTP sent to<br />
                    <strong>{form.email}</strong>
                </p>

                {message && (
                    <div className={`message ${type}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={submit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            name="email"
                            value={form.email}
                            onChange={change}
                            required
                            readOnly
                        />
                    </div>

                    <div className="form-group">
                        <label>OTP Code</label>
                        <input
                            name="otp"
                            value={form.otp}
                            onChange={change}
                            placeholder="Enter 6-digit code"
                            maxLength="6"
                            required
                        />
                    </div>

                    <button
                        className="auth-btn"
                        disabled={loading}
                    >
                        {loading ? "Verifying..." : "Verify Email"}
                    </button>
                </form>

                <div className="auth-links">
                    <button
                        className="link-btn"
                        type="button"
                        onClick={resend}
                        disabled={loading}
                    >
                        Resend OTP
                    </button>
                    <br />
                    <a href="/register">Go back to registration</a>
                </div>
            </div>
        </div>
    );
}

export default VerifyEmail;