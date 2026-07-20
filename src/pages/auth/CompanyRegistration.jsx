import { useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaBuilding, FaCheckCircle } from "react-icons/fa";
import api from "../../api/axios";
import "./Auth.css";

const initialForm = {
  companyName: "",
  industry: "",
  businessRegistrationNumber: "",
  companyEmail: "",
  companyPhone: "",
  address: "",
  website: "",
  description: "",
  logoUrl: "",
  representativeName: "",
  representativeEmail: "",
  representativePhone: "",
};

function CompanyRegistration() {
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const change = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await api.post("/company-onboarding/registrations", form);
      setType("success");
      setSubmitted(true);
      setMessage(
        response.data?.message ||
          "Company registration submitted successfully. A Platform Admin will review it."
      );
      setForm(initialForm);
    } catch (error) {
      const validation = error.response?.data?.errors;
      const validationMessage = validation
        ? Object.values(validation).flat().join(" ")
        : null;

      setType("error");
      setMessage(
        validationMessage ||
          error.response?.data?.message ||
          error.response?.data?.title ||
          "Unable to submit the company registration."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="company-registration-page">
      <div className="company-registration-shell">
        <Link to="/" className="company-registration-back">
          <FaArrowLeft /> Back to portals
        </Link>

        <div className="company-registration-header">
          <div className="company-registration-icon"><FaBuilding /></div>
          <div>
            <span>COMPANY ONBOARDING</span>
            <h1>Register your company</h1>
            <p>
              Submit your organization and representative details for Platform
              Admin review.
            </p>
          </div>
        </div>

        {message && <div className={`message ${type}`}>{message}</div>}

        {submitted ? (
          <div className="company-registration-success">
            <FaCheckCircle />
            <h2>Registration submitted</h2>
            <p>Your request is now waiting for Platform Admin review.</p>
            <Link to="/">Return to HirePath portals</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="company-registration-form">
            <section>
              <h2>Company information</h2>
              <div className="company-form-grid">
                <div className="form-group">
                  <label htmlFor="companyName">Company name *</label>
                  <input id="companyName" name="companyName" value={form.companyName} onChange={change} required />
                </div>
                <div className="form-group">
                  <label htmlFor="industry">Industry</label>
                  <input id="industry" name="industry" value={form.industry} onChange={change} />
                </div>
                <div className="form-group">
                  <label htmlFor="businessRegistrationNumber">Business registration number</label>
                  <input id="businessRegistrationNumber" name="businessRegistrationNumber" value={form.businessRegistrationNumber} onChange={change} />
                </div>
                <div className="form-group">
                  <label htmlFor="companyEmail">Company email *</label>
                  <input id="companyEmail" type="email" name="companyEmail" value={form.companyEmail} onChange={change} required />
                </div>
                <div className="form-group">
                  <label htmlFor="companyPhone">Company phone</label>
                  <input id="companyPhone" name="companyPhone" value={form.companyPhone} onChange={change} />
                </div>
                <div className="form-group">
                  <label htmlFor="website">Website</label>
                  <input id="website" type="url" name="website" placeholder="https://example.com" value={form.website} onChange={change} />
                </div>
                <div className="form-group company-form-wide">
                  <label htmlFor="address">Address</label>
                  <input id="address" name="address" value={form.address} onChange={change} />
                </div>
                <div className="form-group company-form-wide">
                  <label htmlFor="logoUrl">Logo URL</label>
                  <input id="logoUrl" type="url" name="logoUrl" placeholder="https://example.com/logo.png" value={form.logoUrl} onChange={change} />
                </div>
                <div className="form-group company-form-wide">
                  <label htmlFor="description">Company description</label>
                  <textarea id="description" name="description" rows="4" value={form.description} onChange={change} />
                </div>
              </div>
            </section>

            <section>
              <h2>Company representative</h2>
              <div className="company-form-grid">
                <div className="form-group">
                  <label htmlFor="representativeName">Representative name *</label>
                  <input id="representativeName" name="representativeName" value={form.representativeName} onChange={change} required />
                </div>
                <div className="form-group">
                  <label htmlFor="representativeEmail">Representative email *</label>
                  <input id="representativeEmail" type="email" name="representativeEmail" value={form.representativeEmail} onChange={change} required />
                </div>
                <div className="form-group">
                  <label htmlFor="representativePhone">Representative phone</label>
                  <input id="representativePhone" name="representativePhone" value={form.representativePhone} onChange={change} />
                </div>
              </div>
            </section>

            <button className="auth-btn company-submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit company registration"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default CompanyRegistration;
