import { useEffect, useState } from "react";
import platformAdminService from "../../api/platformAdminService";

function PendingCompanies() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);

  const loadPending = async () => {
    setLoading(true);
    setError("");
    try {
      setPending(await platformAdminService.getPendingCompanies());
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load pending company registrations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadPending(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const processRequest = async (id, action) => {
    const note = window.prompt(
      action === "approve" ? "Optional approval note:" : "Reason for rejection:"
    );
    if (note === null) return;

    setProcessingId(id);
    setError("");
    try {
      if (action === "approve") {
        await platformAdminService.approveCompany(id, note || null);
      } else {
        if (!note.trim()) {
          setError("Please enter a rejection reason.");
          return;
        }
        await platformAdminService.rejectCompany(id, note.trim());
      }
      setPending((current) => current.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || `Unable to ${action} this registration.`);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div>Loading pending company registrations...</div>;

  return (
    <div className="card" style={{ padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h3 style={{ margin: 0 }}>Pending Company Registrations</h3>
          <p style={{ margin: "6px 0 0", color: "#6b7280" }}>Requests submitted from the public company registration form.</p>
        </div>
        <button onClick={loadPending} className="auth-btn" style={{ width: "auto", margin: 0, padding: "8px 14px" }}>Refresh</button>
      </div>

      {error && <div className="message error" style={{ marginBottom: 16 }}>{error}</div>}

      <div style={{ overflowX: "auto" }}>
        <table className="tracker-table" style={{ width: "100%" }}>
          <thead><tr><th>Organization</th><th>BR Number</th><th>Representative</th><th>Company Email</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {pending.map((item) => (
              <tr key={item.id}>
                <td><strong>{item.companyName}</strong><div style={{ fontSize: 12, color: "#6b7280" }}>{item.industry || "—"}</div></td>
                <td>{item.businessRegistrationNumber || "—"}</td>
                <td>{item.representativeName}<div style={{ fontSize: 12, color: "#6b7280" }}>{item.representativeEmail}</div></td>
                <td>{item.companyEmail}</td>
                <td><span style={{ color: "#b45309", fontWeight: 700 }}>{item.status}</span></td>
                <td><div style={{ display: "flex", gap: 8 }}>
                  <button disabled={processingId === item.id} onClick={() => processRequest(item.id, "approve")} style={{ padding: "7px 12px", border: 0, borderRadius: 6, background: "#10b981", color: "white" }}>Approve</button>
                  <button disabled={processingId === item.id} onClick={() => processRequest(item.id, "reject")} style={{ padding: "7px 12px", border: 0, borderRadius: 6, background: "#ef4444", color: "white" }}>Reject</button>
                </div></td>
              </tr>
            ))}
            {pending.length === 0 && <tr><td colSpan="6" style={{ textAlign: "center", padding: 28, color: "#6b7280" }}>No pending registrations.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PendingCompanies;
