import { useState } from "react";
import api from "../../api/axios";
import "./Auth.css";

function Register() {
    const [form, setForm] = useState({
        fullName: "",
        userName: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "Candidate",
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
            await api.post("/Auth/register", form);
            localStorage.setItem("verifyEmail", form.email);

            setType("success");
            setMessage("OTP sent to your email.");

            setTimeout(() => {
                window.location.href = "/verify-email";
            }, 1000);
        } catch (err) {
            setType("error");
            setMessage(err.response?.data?.message || "Registration failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-badge">AI Recruitment Platform</div>
                <h1>Create Account</h1>
                <p>Register and verify your email</p>

                {message && <div className={`message ${type}`}>{message}</div>}

                <form onSubmit={submit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input name="fullName" value={form.fullName} onChange={change} required />
                    </div>

                    <div className="form-group">
                        <label>Username</label>
                        <input name="userName" value={form.userName} onChange={change} required />
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" name="email" value={form.email} onChange={change} required />
                    </div>

                    <div className="form-group">
                        <label>Role</label>
                        <select name="role" value={form.role} onChange={change}>
                            <option value="Candidate">Candidate</option>
                            <option value="Recruiter">Recruiter</option>
                            <option value="HiringManager">Hiring Manager</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" name="password" value={form.password} onChange={change} required />
                    </div>

                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={change} required />
                    </div>

                    <button className="auth-btn" disabled={loading}>
                        {loading ? "Sending OTP..." : "Register"}
                    </button>
                </form>

                <div className="auth-links">
                    <a href="/login">Already have an account?</a>
                </div>
            </div>
        </div>
    );
}

export default Register;