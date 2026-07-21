import { useEffect, useMemo, useState } from "react";
import HiringSidebar from "./HiringSidebar";
import applicationApi, { STATUS_VALUE, statusLabel } from "../../api/applicationApi";
import interviewApi from "../../api/interviewApi";
import feedbackApi, { RECOMMENDATION } from "../../api/feedbackApi";
import evaluationApi from "../../api/evaluationApi";

const relevant = [STATUS_VALUE.InterviewScheduled, STATUS_VALUE.Interviewed, STATUS_VALUE.Offered, STATUS_VALUE.Hired];
const nameOf = (a) => a.candidateProfile?.user?.fullName || a.candidateProfile?.headline || "Candidate";
const jobOf = (a) => a.job?.title || a.jobTitle || "Job position";
const btn = { border: 0, borderRadius: 8, padding: "8px 12px", cursor: "pointer", fontWeight: 600 };

export default function HiringDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(null);

  const load = async () => {
    setLoading(true); setError("");
    try {
      const { data } = await applicationApi.getByCompany();
      setApplications((Array.isArray(data) ? data : data?.$values || []).filter((a) => relevant.includes(a.status)));
    } catch (e) {
      setError(e.response?.data?.message || e.response?.data || "Failed to load hiring pipeline.");
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const stats = useMemo(() => ({
    scheduled: applications.filter((a) => a.status === STATUS_VALUE.InterviewScheduled).length,
    interviewed: applications.filter((a) => a.status === STATUS_VALUE.Interviewed).length,
    offered: applications.filter((a) => a.status === STATUS_VALUE.Offered).length,
    hired: applications.filter((a) => a.status === STATUS_VALUE.Hired).length,
  }), [applications]);

  const action = async (id, work) => {
    setBusy(id);
    try { await work(); await load(); }
    catch (e) { alert(e.response?.data?.message || e.response?.data || "Action failed."); }
    finally { setBusy(null); }
  };

  const submitFeedback = async (app) => {
    const { data } = await interviewApi.getByApplication(app.id);
    const list = Array.isArray(data) ? data : data?.$values || [];
    const interview = list.find((x) => x.status === 1) || list.at(-1);
    if (!interview) throw new Error("No interview found for this application.");
    const comments = window.prompt("Enter interview feedback/comments:", "Good candidate");
    if (comments === null) return;
    await feedbackApi.submit(interview.id, 7, 7, 7, comments, RECOMMENDATION.Hire);
    await applicationApi.markInterviewCompleted(app.id, comments);
  };

  const runEvaluation = async (app) => {
    await evaluationApi.createOrUpdate(app.id, null, null);
    alert("Candidate evaluation completed and saved.");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", color: "#0f172a" }}>
      <HiringSidebar />
      <main style={{ flex: 1, padding: "38px 42px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, marginBottom: 28 }}>
          <div><h1 style={{ margin: 0, fontSize: 30 }}>Hiring Manager Dashboard Overview</h1><p style={{ color: "#64748b" }}>Review interviews, evaluations, offers and final hiring decisions.</p></div>
          <button onClick={load} style={{ ...btn, background: "#4f46e5", color: "white", padding: "11px 18px" }}>Refresh</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 20, marginBottom: 28 }}>
          {[["INTERVIEWS SCHEDULED", stats.scheduled, "📅"], ["AWAITING DECISION", stats.interviewed, "🧾"], ["OFFERS MADE", stats.offered, "✉️"], ["HIRED", stats.hired, "✅"]].map(([label, value, icon]) => (
            <div key={label} style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 16, padding: 24, display: "flex", justifyContent: "space-between" }}>
              <div><div style={{ color: "#94a3b8", fontSize: 13, fontWeight: 700 }}>{label}</div><div style={{ fontSize: 34, fontWeight: 800, marginTop: 12 }}>{value}</div></div>
              <div style={{ fontSize: 24, background: "#eef2ff", width: 54, height: 54, display: "grid", placeItems: "center", borderRadius: 14 }}>{icon}</div>
            </div>
          ))}
        </div>

        <section style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 16, padding: 26 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}><div><h2 style={{ margin: 0, fontSize: 20 }}>Interview Pipeline</h2><p style={{ margin: "6px 0 0", color: "#94a3b8" }}>Live candidate data from the recruitment database.</p></div><strong>{applications.length} candidates</strong></div>
          {error && <div style={{ background: "#fef2f2", color: "#b91c1c", padding: 12, borderRadius: 8 }}>{String(error)}</div>}
          {loading ? <p>Loading pipeline...</p> : applications.length === 0 ? <div style={{ padding: "45px 0", textAlign: "center", color: "#94a3b8" }}>No candidates in your interview pipeline right now.</div> : (
            <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr style={{ background: "#f8fafc", textAlign: "left" }}>{["Candidate", "Job", "Status", "Match", "Actions"].map((h) => <th key={h} style={{ padding: 13 }}>{h}</th>)}</tr></thead><tbody>
              {applications.map((app) => <tr key={app.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                <td style={{ padding: 14 }}><b>{nameOf(app)}</b><div style={{ color: "#94a3b8", fontSize: 12 }}>{app.candidateProfile?.user?.email || "Candidate profile"}</div></td>
                <td style={{ padding: 14 }}>{jobOf(app)}</td>
                <td style={{ padding: 14 }}><span style={{ background: "#eef2ff", color: "#4338ca", padding: "6px 9px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{statusLabel(app.status)}</span></td>
                <td style={{ padding: 14 }}>{app.matchScore != null ? `${app.matchScore}%` : "—"}</td>
                <td style={{ padding: 14 }}><div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {app.status === STATUS_VALUE.InterviewScheduled && <button disabled={busy===app.id} onClick={() => action(app.id, () => submitFeedback(app))} style={{...btn,background:"#e0f2fe",color:"#0369a1"}}>Submit Feedback</button>}
                  {[STATUS_VALUE.Interviewed, STATUS_VALUE.Offered].includes(app.status) && <button disabled={busy===app.id} onClick={() => action(app.id, () => runEvaluation(app))} style={{...btn,background:"#f3e8ff",color:"#7e22ce"}}>Evaluate</button>}
                  {app.status === STATUS_VALUE.Interviewed && <button disabled={busy===app.id} onClick={() => action(app.id, () => applicationApi.offer(app.id, null))} style={{...btn,background:"#fef3c7",color:"#92400e"}}>Make Offer</button>}
                  {app.status === STATUS_VALUE.Offered && <button disabled={busy===app.id} onClick={() => action(app.id, () => applicationApi.hire(app.id, null))} style={{...btn,background:"#dcfce7",color:"#166534"}}>Hire</button>}
                </div></td>
              </tr>)}
            </tbody></table></div>
          )}
        </section>
      </main>
    </div>
  );
}
