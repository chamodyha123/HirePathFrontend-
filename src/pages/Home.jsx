import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaBuilding,
  FaShieldAlt,
  FaUserGraduate,
  FaUserPlus,
} from "react-icons/fa";
import { MdWorkOutline } from "react-icons/md";
import "./auth/Auth.css";

const portalCards = [
  {
    title: "Candidate Portal",
    description: "Search jobs, manage your profile, upload resumes and track applications.",
    icon: <FaUserGraduate />,
    link: "/login?portal=candidate",
    tag: "Job seekers",
    imageClass: "candidate-card",
  },
  {
    title: "Company Portal",
    description: "Manage jobs, candidates, interview workflows and your hiring team.",
    icon: <FaBuilding />,
    link: "/login?portal=company",
    tag: "Recruiters & hiring managers",
    imageClass: "company-card",
  },
  {
    title: "Platform Admin",
    description: "Review companies, manage users and monitor the HirePath platform.",
    icon: <FaShieldAlt />,
    link: "/login?portal=admin",
    tag: "Authorized administrators",
    imageClass: "admin-card",
  },
];

function Home() {
  return (
    <div className="portal-page">
      <header className="portal-header">
        <Link to="/" className="brand-block" aria-label="HirePath home">
          <div className="brand-mark">H</div>
          <div>
            <span className="brand-eyebrow">AI RECRUITMENT PLATFORM</span>
            <strong>HirePath</strong>
            <small>Portals &amp; Registration</small>
          </div>
        </Link>

        <div className="header-actions">
          <span className="welcome-text">Build your next opportunity</span>
          <Link className="header-login" to="/login">Sign in</Link>
        </div>
      </header>

      <main>
        <section className="portal-hero">
          <div className="hero-badge">AI-powered hiring ecosystem</div>
          <h1>
            HirePath <span>Portals &amp; Registration</span>
          </h1>
          <p>
            Everything candidates, recruiters and administrators need to move
            through the hiring journey in one secure platform.
          </p>
        </section>

        <nav className="portal-tabs" aria-label="Portal categories">
          <span>Browse:</span>
          <a className="active" href="#portals">User Portals</a>
          <a href="#registration">Registration</a>
          <a href="#about">Platform Information</a>
        </nav>

        <section className="portal-content" id="portals">
          <div className="section-heading">
            <div className="section-icon"><MdWorkOutline /></div>
            <div>
              <h2>User Portals</h2>
              <p>Select your portal and sign in using your HirePath account.</p>
            </div>
            <div className="heading-line" />
          </div>

          <div className="portal-grid">
            {portalCards.map((card) => (
              <Link to={card.link} className={`portal-card ${card.imageClass}`} key={card.title}>
                <div className="portal-card-overlay" />
                <div className="portal-card-icon">{card.icon}</div>
                <span className="portal-card-arrow"><FaArrowRight /></span>
                <div className="portal-card-content">
                  <small>{card.tag}</small>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="registration-section" id="registration">
          <div className="section-heading compact">
            <div className="section-icon"><FaUserPlus /></div>
            <div>
              <h2>Registration</h2>
              <p>Create an account or register your company to join HirePath.</p>
            </div>
          </div>

          <div className="registration-grid">
            <div className="registration-card">
              <span className="registration-number">01</span>
              <h3>Candidate Registration</h3>
              <p>Create a candidate profile, verify your email and begin applying for jobs.</p>
              <Link to="/register">Create candidate account <FaArrowRight /></Link>
            </div>

            <div className="registration-card">
              <span className="registration-number">02</span>
              <h3>Company Registration</h3>
              <p>Submit your organization details for Platform Admin review and approval.</p>
              <Link to="/company-registration">Register a company <FaArrowRight /></Link>
            </div>
          </div>
        </section>

        <section className="about-strip" id="about">
          <div>
            <strong>Secure access</strong>
            <span>JWT authentication and role-based portals</span>
          </div>
          <div>
            <strong>Smart recruitment</strong>
            <span>AI-assisted matching and candidate insights</span>
          </div>
          <div>
            <strong>Connected workflow</strong>
            <span>From registration to hiring in one platform</span>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;
