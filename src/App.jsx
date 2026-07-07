import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

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
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                <Route path="/candidate-dashboard" element={<Placeholder title="Candidate Dashboard" />} />
                <Route path="/recruiter-dashboard" element={<Placeholder title="Recruiter Dashboard" />} />
                <Route path="/hiring-dashboard" element={<Placeholder title="Hiring Manager Dashboard" />} />
                <Route path="/admin-dashboard" element={<Placeholder title="Admin Dashboard" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;