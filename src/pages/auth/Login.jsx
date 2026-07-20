import { useState } from "react";
import api from "../../api/axios";
import "./Auth.css";

function Login() {
    const [form, setForm] = useState({
        emailOrUsername: "",
        password: "",
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
            const res = await api.post("/Auth/login", form);
            const data = res.data;

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data));

            setType("success");
            setMessage("Login successful.");

            const role = data.roles?.[0];

            setTimeout(() => {
                // 💡 Fix: Admin හෝ SuperAdmin රෝල්ස් සඳහා නව /platform-admin route එකට රීඩිරෙක්ට් කිරීම
                if (role === "Admin" || role === "SuperAdmin") {
                    window.location.href = "/platform-admin";
                } 
                else if (role === "Recruiter") {
                    window.location.href = "/recruiter-dashboard";
                } 
                else if (role === "HiringManager") {
                    window.location.href = "/hiring-dashboard";
                } 
                else {
                    window.location.href = "/candidate-dashboard";
                }
            }, 800);
        } catch (err) {
            setType("error");
            setMessage(err.response?.data?.message || "Login failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-badge">AI Recruitment Platform</div>
                <h1>HirePath AI</h1>
                <p>Login to your account</p>

                {message && <div className={`message ${type}`}>{message}</div>}

                <form onSubmit={submit}>
                    <div className="form-group">
                        <label>Email or Username</label>
                        <input name="emailOrUsername" value={form.emailOrUsername} onChange={change} required />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" name="password" value={form.password} onChange={change} required />
                    </div>

                    <button className="auth-btn" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <div className="auth-links">
                    <a href="/forgot-password">Forgot Password?</a> | <a href="/register">Register</a>
                </div>
            </div>
        </div>
    );
}

export default Login;