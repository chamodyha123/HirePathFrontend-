import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// Recruiter Portal Components Import
import RecruiterDashboard from "./pages/recruiter/RecruiterDashboard";
import JobManagement from "./pages/recruiter/JobManagement";
import CandidateTracker from "./pages/recruiter/CandidateTracker";

function Placeholder({ title }) {
    return (
        <div style={{ padding: "40px", fontFamily: "Arial" }}>
            <h1>{title}</h1>
            <p>This dashboard will be developed later.</p>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public & Auth Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Other User Dashboards (Placeholders) */}
                <Route path="/candidate-dashboard" element={<Placeholder title="Candidate Dashboard" />} />
                <Route path="/hiring-dashboard" element={<Placeholder title="Hiring Manager Dashboard" />} />
                <Route path="/admin-dashboard" element={<Placeholder title="Admin Dashboard" />} />

                {/* Full Recruiter Portal Integration */}
                <Route path="/recruiter-dashboard" element={<RecruiterDashboard />} />
                <Route path="/recruiter-dashboard/jobs" element={<JobManagement />} />
                <Route path="/recruiter-dashboard/candidates" element={<CandidateTracker />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;