import { Link } from "react-router-dom";
import "./auth/Auth.css";
import { FaRobot } from "react-icons/fa";
import { MdWork } from "react-icons/md";
import { BsCalendar2CheckFill } from "react-icons/bs";
import { HiChartBar } from "react-icons/hi";

function Home() {
    return (
        <div className="auth-page">
            <div className="auth-card home-card">
                <div className="auth-badge">AI Powered Recruitment Platform</div>

                <h1>
                    HirePath <span className="logo-ai">AI</span>
                </h1>

                <p className="home-description">
                    Welcome to <strong>HirePath AI</strong>, an intelligent recruitment
                    platform that helps candidates and recruiters connect faster through
                    AI-powered hiring, resume analysis, interview scheduling, and smart
                    candidate matching.
                </p>

                <div className="feature-grid">
                    <div className="feature-box">
                        <span><FaRobot /></span>
                        <h4>AI Resume Analysis</h4>
                    </div>

                    <div className="feature-box">
                        <span><MdWork /></span>
                        <h4>Smart Job Matching</h4>
                    </div>

                    <div className="feature-box">
                        <span><BsCalendar2CheckFill /></span>
                        <h4>Interview Scheduling</h4>
                    </div>

                    <div className="feature-box">
                        <span><HiChartBar /></span>
                        <h4>Analytics Dashboard</h4>
                    </div>
                </div>

                <div className="home-buttons">
                    <Link className="auth-btn home-main-btn" to="/login">
                        Get Started
                    </Link>

                    <Link className="outline-btn" to="/register">
                        Create Account
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Home;