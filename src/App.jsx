import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// Candidate components නිවැරදි paths සහිතව import කිරීම
import CandidateDashboard from "./pages/candidate/CandidateDashboard";
import Profile from "./pages/candidate/Profile";
import ResumeManager from "./pages/candidate/ResumeManager";
import SkillsSection from "./pages/candidate/SkillsSection";

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
                {/* Auth & Home Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Candidate Dashboard Routes */}
                {/* දැන් ලොග් වූ පසු කෙලින්ම යන්නේ CandidateDashboard එකටයි */}
                <Route path="/candidate-dashboard" element={<CandidateDashboard />} />
                <Route path="/candidate/profile" element={<Profile userId={1} />} />
                <Route path="/candidate/resumes" element={<ResumeManager />} />
                <Route path="/candidate/skills" element={<SkillsSection />} />

                {/* Other Dashboards */}
                <Route path="/recruiter-dashboard" element={<Placeholder title="Recruiter Dashboard" />} />
                <Route path="/hiring-dashboard" element={<Placeholder title="Hiring Manager Dashboard" />} />
                <Route path="/admin-dashboard" element={<Placeholder title="Admin Dashboard" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;