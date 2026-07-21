import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Home from "./pages/Home";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import CompanyRegistration from "./pages/auth/CompanyRegistration";

import CandidateDashboard from "./pages/candidate/CandidateDashboard";
import Profile from "./pages/candidate/Profile";
import ResumeManager from "./pages/candidate/ResumeManager";
import SkillsSection from "./pages/candidate/SkillsSection";

import HiringDashboard from "./pages/hiring/HiringDashboard";

import ProtectedRoute from "./components/ProtectedRoute";

import PlatformAdminLayout from "./layouts/PlatformAdminLayout";
import PlatformAdminDashboard from "./pages/platform-admin/PlatformAdminDashboard";
import Companies from "./pages/platform-admin/Companies";
import PendingCompanies from "./pages/platform-admin/PendingCompanies";
import Users from "./pages/platform-admin/Users";
import Analytics from "./pages/platform-admin/Analytics";

function Placeholder({ title, description }) {
  return (
    <div
      style={{
        minHeight: "60vh",
        padding: "48px",
        color: "#ffffff",
        fontFamily: "Inter, Arial, sans-serif",
        background: "#111827",
        border: "1px solid #26324a",
        borderRadius: "16px",
      }}
    >
      <h1 style={{ marginTop: 0 }}>{title}</h1>

      <p style={{ color: "#9ca3af" }}>
        {description ||
          "This module has not been implemented yet."}
      </p>
    </div>
  );
}

function AdminGuard({ children }) {
  return (
    <ProtectedRoute roles={["Admin"]}>
      {children}
    </ProtectedRoute>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/company-registration"
          element={<CompanyRegistration />}
        />

        <Route
          path="/verify-email"
          element={<VerifyEmail />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        {/* Candidate routes */}
        <Route
          path="/candidate-dashboard"
          element={
            <ProtectedRoute roles={["Candidate"]}>
              <CandidateDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/candidate/profile"
          element={
            <ProtectedRoute roles={["Candidate"]}>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/candidate/resumes"
          element={
            <ProtectedRoute roles={["Candidate"]}>
              <ResumeManager />
            </ProtectedRoute>
          }
        />

        <Route
          path="/candidate/skills"
          element={
            <ProtectedRoute roles={["Candidate"]}>
              <SkillsSection />
            </ProtectedRoute>
          }
        />

        {/* Recruiter and Company Admin placeholders */}
        <Route
          path="/recruiter-dashboard"
          element={
            <ProtectedRoute
              roles={["Recruiter", "CompanyAdmin"]}
            >
              <Placeholder
                title="Recruiter Dashboard"
                description="The recruiter frontend module has not been added to this project yet."
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recruiter-dashboard/jobs"
          element={
            <ProtectedRoute
              roles={["Recruiter", "CompanyAdmin"]}
            >
              <Placeholder
                title="Job Management"
                description="The job management frontend page has not been added yet."
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recruiter-dashboard/candidates"
          element={
            <ProtectedRoute
              roles={["Recruiter", "CompanyAdmin"]}
            >
              <Placeholder
                title="Candidate Tracker"
                description="The candidate tracker frontend page has not been added yet."
              />
            </ProtectedRoute>
          }
        />

        {/* Hiring Manager route */}
        <Route
          path="/hiring-dashboard"
          element={
            <ProtectedRoute roles={["HiringManager"]}>
              <HiringDashboard />
            </ProtectedRoute>
          }
        />

        {/* Old admin redirect */}
        <Route
          path="/admin-dashboard"
          element={
            <Navigate
              to="/platform-admin"
              replace
            />
          }
        />

        {/* Platform Admin routes */}
        <Route
          path="/platform-admin"
          element={
            <AdminGuard>
              <PlatformAdminLayout />
            </AdminGuard>
          }
        >
          <Route
            index
            element={<PlatformAdminDashboard />}
          />

          <Route
            path="companies"
            element={<Companies />}
          />

          <Route
            path="companies/pending"
            element={<PendingCompanies />}
          />

          <Route
            path="users"
            element={<Users />}
          />

          <Route
            path="analytics"
            element={<Analytics />}
          />
        </Route>

        {/* Unknown routes */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;