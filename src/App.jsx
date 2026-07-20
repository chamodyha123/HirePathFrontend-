import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import CompanyRegistration from "./pages/auth/CompanyRegistration";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// Candidate Portal Imports
import CandidateDashboard from "./pages/candidate/CandidateDashboard";
import Profile from "./pages/candidate/Profile";
import ResumeManager from "./pages/candidate/ResumeManager";
import SkillsSection from "./pages/candidate/SkillsSection";

// Recruiter Portal Imports
import RecruiterDashboard from "./pages/recruiter/RecruiterDashboard";
import JobManagement from "./pages/recruiter/JobManagement";
import CandidateTracker from "./pages/recruiter/CandidateTracker";

// Platform Admin / Super Admin Layout & Pages Mappings [NEW]
import PlatformAdminLayout from "./layouts/PlatformAdminLayout";
import PlatformAdminDashboard from "./pages/platform-admin/PlatformAdminDashboard";
import Companies from "./pages/platform-admin/Companies";
import PendingCompanies from "./pages/platform-admin/PendingCompanies";
import Users from "./pages/platform-admin/Users";
import Analytics from "./pages/platform-admin/Analytics";

import ProtectedRoute from "./components/ProtectedRoute";

function Placeholder({ title }) {
  return (
    <div style={{ minHeight: "100vh", padding: "48px", fontFamily: "Inter, Arial", background: "#f5f7fb" }}>
      <h1>{title}</h1>
      <p>This dashboard will be connected to the member frontend when it is ready.</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Core Auth & Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/company-registration" element={<CompanyRegistration />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Candidate Dashboard Infrastructure */}
        <Route path="/candidate-dashboard" element={<ProtectedRoute roles={["Candidate"]}><CandidateDashboard /></ProtectedRoute>} />
        <Route path="/candidate/profile" element={<ProtectedRoute roles={["Candidate"]}><Profile userId={1} /></ProtectedRoute>} />
        <Route path="/candidate/resumes" element={<ProtectedRoute roles={["Candidate"]}><ResumeManager /></ProtectedRoute>} />
        <Route path="/candidate/skills" element={<ProtectedRoute roles={["Candidate"]}><SkillsSection /></ProtectedRoute>} />

        {/* Recruiter Dashboard Infrastructure */}
        <Route path="/recruiter-dashboard" element={<ProtectedRoute roles={["Recruiter", "CompanyAdmin"]}><RecruiterDashboard /></ProtectedRoute>} />
        <Route path="/recruiter-dashboard/jobs" element={<ProtectedRoute roles={["Recruiter", "CompanyAdmin"]}><JobManagement /></ProtectedRoute>} />
        <Route path="/recruiter-dashboard/candidates" element={<ProtectedRoute roles={["Recruiter", "CompanyAdmin"]}><CandidateTracker /></ProtectedRoute>} />

        {/* Real Enterprise Platform Administration Portal [NEW] */}
        <Route 
          path="/platform-admin" 
          element={
            <ProtectedRoute roles={["Admin", "SuperAdmin"]}>
              <PlatformAdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<PlatformAdminDashboard />} />
          <Route path="companies" element={<Companies />} />
          <Route path="companies/pending" element={<PendingCompanies />} />
          <Route path="users" element={<Users />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>

        {/* Standby Portals Fallbacks */}
        <Route path="/hiring-dashboard" element={<ProtectedRoute roles={["HiringManager"]}><Placeholder title="Hiring Manager Dashboard" /></ProtectedRoute>} />
        <Route path="/admin-dashboard" element={<ProtectedRoute roles={["Admin", "SuperAdmin"]}><Placeholder title="Platform Admin Dashboard" /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;