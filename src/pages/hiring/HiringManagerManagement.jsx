import { useEffect, useState } from "react";
import companyAdminService from "../../api/companyAdminService";

export default function HiringManagerManagement() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ fullName: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try { setItems(await companyAdminService.getHiringManagers()); }
    catch (e) { setError(e.response?.data?.message || "Unable to load Hiring Managers."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault(); setError(""); setMessage("");
    try {
      const result = await companyAdminService.inviteHiringManager(form);
      setMessage(result.message || "Invitation sent.");
      setForm({ fullName: "", email: "" });
      await load();
    } catch (err) { setError(err.response?.data?.message || "Unable to send invitation."); }
  };

  const toggle = async (item) => {
    setError("");
    try { await companyAdminService.updateHiringManagerStatus(item.id, !item.isActive); await load(); }
    catch (err) { setError(err.response?.data?.message || "Unable to update status."); }
  };

  const remove = async (item) => {
    if (!window.confirm(`Remove ${item.fullName}?`)) return;
    setError("");
    try { await companyAdminService.deleteHiringManager(item.id); await load(); }
    catch (err) { setError(err.response?.data?.message || "Unable to remove Hiring Manager."); }
  };

  return <div className="company-admin-page">
    <header className="company-admin-header"><div><h1>Hiring Manager Management</h1><p>Invite, view, activate and deactivate your company Hiring Managers.</p></div></header>
    {error && <div className="company-admin-message error">{error}</div>}
    {message && <div className="company-admin-message success">{message}</div>}
    <form onSubmit={submit} className="company-admin-form">
      <input required placeholder="Full name" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} />
      <input required type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
      <button className="company-admin-primary">Send Invitation</button>
    </form>
    <div className="company-admin-table-wrap">
      {loading ? <p>Loading...</p> : <table className="company-admin-table"><thead><tr><th>Name</th><th>Email</th><th>Username</th><th>Status</th><th>Actions</th></tr></thead><tbody>
        {items.map(item => <tr key={item.id}><td>{item.fullName}</td><td>{item.email}</td><td>{item.userName || "—"}</td><td>{item.isActive ? "Active" : "Inactive"}</td><td><button className="company-admin-action" onClick={() => toggle(item)}>{item.isActive ? "Deactivate" : "Activate"}</button><button className="company-admin-action danger" onClick={() => remove(item)}>Remove</button></td></tr>)}
        {!items.length && <tr><td colSpan="5" style={{ textAlign: "center", padding: 24 }}>No Hiring Managers found.</td></tr>}
      </tbody></table>}
    </div>
  </div>;
}
