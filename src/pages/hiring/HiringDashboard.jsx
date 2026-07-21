import { useEffect, useMemo, useState } from "react";
import HiringSidebar from "./HiringSidebar";
import applicationApi, {
  STATUS_VALUE,
  statusLabel,
  normalizeApplication,
  normalizeCollection,
} from "../../api/applicationApi";
import interviewApi, { INTERVIEW_TYPE } from "../../api/interviewApi";
import feedbackApi, { RECOMMENDATION } from "../../api/feedbackApi";
import evaluationApi from "../../api/evaluationApi";

const relevant = [
  STATUS_VALUE.Shortlisted,
  STATUS_VALUE.InterviewScheduled,
  STATUS_VALUE.Interviewed,
  STATUS_VALUE.Offered,
  STATUS_VALUE.Hired,
];
const nameOf = (a) => a.candidateProfile?.user?.fullName || a.candidateProfile?.headline || "Candidate";
const emailOf = (a) => a.candidateProfile?.user?.email || "Candidate profile";
const jobOf = (a) => a.job?.title || a.jobTitle || "Job position";
const btn = { border: 0, borderRadius: 8, padding: "8px 12px", cursor: "pointer", fontWeight: 600 };
const interviewStatus = (value) => {
  if (typeof value === "number") return value;
  return { Scheduled: 1, Completed: 2, Cancelled: 3, Rescheduled: 4, NoShow: 5 }[value] || Number(value) || 0;
};

export default function HiringDashboard() {
  const [apps, setApps] = useState([]);
  const [interviews, setInterviews] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await applicationApi.getByCompany();
      const list = normalizeCollection(data).map(normalizeApplication).filter((a) => relevant.includes(a.status));
      setApps(list);
      const pairs = await Promise.all(
        list.map(async (a) => {
          try {
            const response = await interviewApi.getByApplication(a.id);
            return [a.id, normalizeCollection(response.data)];
          } catch {
            return [a.id, []];
          }
        })
      );
      setInterviews(Object.fromEntries(pairs));
    } catch (e) {
      setError(e.response?.data?.message || e.response?.data || "Failed to load hiring pipeline.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const stats = useMemo(() => ({
    shortlisted: apps.filter((a) => a.status === STATUS_VALUE.Shortlisted).length,
    scheduled: apps.filter((a) => a.status === STATUS_VALUE.InterviewScheduled).length,
    awaiting: apps.filter((a) => a.status === STATUS_VALUE.Interviewed).length,
    hired: apps.filter((a) => a.status === STATUS_VALUE.Hired).length,
  }), [apps]);

  const run = async (id, work) => {
    setBusy(id);
    try { await work(); await load(); }
    catch (e) { alert(e.response?.data?.message || e.response?.data || e.message || "Action failed."); }
    finally { setBusy(null); }
  };

  const schedule = async (app) => {
    const date = prompt("Interview date/time (example 2026-07-25T10:30):", new Date(Date.now() + 86400000).toISOString().slice(0, 16));
    if (!date) return;
    const type = prompt("Type: Online, Physical or Phone", INTERVIEW_TYPE.Online) || INTERVIEW_TYPE.Online;
    let link = null, location = null;
    if (type.toLowerCase() === "online") link = prompt("Meeting link:", "https://meet.google.com/") || null;
    else location = prompt("Location:", "Company office") || null;
    const panel = prompt("Interview panel names/emails:", "") || null;
    const notes = prompt("Notes:", "") || null;
    await interviewApi.schedule(app.id, new Date(date).toISOString(), type, link, location, panel, notes);
  };

  const reschedule = async (interview) => {
    const date = prompt("New interview date/time:", new Date(interview.scheduledAt).toISOString().slice(0, 16));
    if (!date) return;
    await interviewApi.update(interview.id, {
      scheduledAt: new Date(date).toISOString(),
      meetingLink: interview.meetingLink,
      location: interview.location,
      panel: interview.panel,
      notes: interview.notes,
      status: "Rescheduled",
    });
  };

  const submitFeedback = async (app, interview) => {
    if (!interview) throw new Error("No interview found.");
    const technical = Number(prompt("Technical score (0-10):", "7"));
    const communication = Number(prompt("Communication score (0-10):", "7"));
    const problem = Number(prompt("Problem solving score (0-10):", "7"));
    const comments = prompt("Feedback comments:", "Good candidate");
    if (comments === null) return;
    const recommendation = prompt("Recommendation: Hire, Hold or Reject", RECOMMENDATION.Hire) || RECOMMENDATION.Hire;
    await feedbackApi.submit(interview.id, technical, communication, problem, comments, recommendation);
    await applicationApi.markInterviewCompleted(app.id, comments);
  };

  const evaluate = async (app) => {
    const resume = prompt("Resume score 0-100 (blank = existing AI score):", "");
    const ai = prompt("AI score 0-100 (blank = existing match score):", "");
    const { data } = await evaluationApi.createOrUpdate(app.id, resume === "" ? null : Number(resume), ai === "" ? null : Number(ai));
    alert(`Evaluation saved. Overall score: ${data.overallScore ?? "N/A"}`);
  };

  const reject = async (app) => {
    const reason = prompt(`Reason for rejecting ${nameOf(app)}:`, "Not selected after review");
    if (reason === null) return;
    await applicationApi.reject(app.id, reason);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", color: "#0f172a" }}>
      <HiringSidebar />
      <main style={{ flex: 1, padding: "38px 42px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 30 }}>Hiring Manager Dashboard Overview</h1>
            <p style={{ color: "#64748b" }}>Review shortlisted applicants, interviews, evaluations and final hiring decisions.</p>
          </div>
          <button onClick={load} style={{ ...btn, background: "#4f46e5", color: "white", padding: "11px 18px" }}>Refresh</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 20, marginBottom: 28 }}>
          {[["SHORTLISTED", stats.shortlisted, "👥"], ["INTERVIEWS SCHEDULED", stats.scheduled, "📅"], ["AWAITING DECISION", stats.awaiting, "🧾"], ["HIRED", stats.hired, "✅"]].map(([label, value, icon]) => (
            <div key={label} style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 16, padding: 24, display: "flex", justifyContent: "space-between" }}>
              <div><div style={{ color: "#94a3b8", fontSize: 13, fontWeight: 700 }}>{label}</div><div style={{ fontSize: 34, fontWeight: 800, marginTop: 12 }}>{value}</div></div>
              <div style={{ fontSize: 24, background: "#eef2ff", width: 54, height: 54, display: "grid", placeItems: "center", borderRadius: 14 }}>{icon}</div>
            </div>
          ))}
        </div>

        <section style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 16, padding: 26 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
            <div><h2 style={{ margin: 0, fontSize: 20 }}>Candidate & Interview Pipeline</h2><p style={{ margin: "6px 0 0", color: "#94a3b8" }}>Live shortlisted applications and interview records.</p></div>
            <strong>{apps.length} candidates</strong>
          </div>
          {error && <div style={{ background: "#fef2f2", color: "#b91c1c", padding: 12, borderRadius: 8 }}>{String(error)}</div>}
          {loading ? <p>Loading pipeline...</p> : apps.length === 0 ? <div style={{ padding: "45px 0", textAlign: "center", color: "#94a3b8" }}>No shortlisted candidates or interviews right now.</div> : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr style={{ background: "#f8fafc", textAlign: "left" }}>{["Candidate", "Job", "Status", "Interview", "Match", "Actions"].map((h) => <th key={h} style={{ padding: 13 }}>{h}</th>)}</tr></thead>
                <tbody>{apps.map((app) => {
                  const list = interviews[app.id] || [];
                  const interview = list.find((x) => [1, 4].includes(interviewStatus(x.status))) || list.at(-1);
                  const activeInterview = interview && [1, 4].includes(interviewStatus(interview.status));
                  return (
                    <tr key={app.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                      <td style={{ padding: 14 }}><b>{nameOf(app)}</b><div style={{ color: "#94a3b8", fontSize: 12 }}>{emailOf(app)}</div></td>
                      <td style={{ padding: 14 }}>{jobOf(app)}</td>
                      <td style={{ padding: 14 }}><span style={{ background: "#eef2ff", color: "#4338ca", padding: "6px 9px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{statusLabel(app.status)}</span></td>
                      <td style={{ padding: 14 }}>{interview ? <><b>{new Date(interview.scheduledAt).toLocaleString()}</b><br /><small>{interview.meetingLink || interview.location || interview.interviewType}</small></> : "Not scheduled"}</td>
                      <td style={{ padding: 14 }}>{app.matchScore != null ? `${app.matchScore}%` : "—"}</td>
                      <td style={{ padding: 14 }}><div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                        {app.status === STATUS_VALUE.Shortlisted && !activeInterview && <button disabled={busy === app.id} onClick={() => run(app.id, () => schedule(app))} style={{ ...btn, background: "#dbeafe", color: "#1d4ed8" }}>Schedule</button>}
                        {activeInterview && <><button disabled={busy === app.id} onClick={() => run(app.id, () => reschedule(interview))} style={{ ...btn, background: "#e0f2fe", color: "#0369a1" }}>Reschedule</button><button disabled={busy === app.id} onClick={() => run(app.id, () => interviewApi.cancel(interview.id, "Cancelled by Hiring Manager"))} style={{ ...btn, background: "#fee2e2", color: "#b91c1c" }}>Cancel</button><button disabled={busy === app.id} onClick={() => run(app.id, () => submitFeedback(app, interview))} style={{ ...btn, background: "#dcfce7", color: "#166534" }}>Feedback / Interviewed</button></>}
                        {[STATUS_VALUE.Interviewed, STATUS_VALUE.Offered].includes(app.status) && <button disabled={busy === app.id} onClick={() => run(app.id, () => evaluate(app))} style={{ ...btn, background: "#f3e8ff", color: "#7e22ce" }}>Evaluate</button>}
                        {app.status === STATUS_VALUE.Interviewed && <button disabled={busy === app.id} onClick={() => run(app.id, () => applicationApi.offer(app.id, "Offer approved by Hiring Manager"))} style={{ ...btn, background: "#fef3c7", color: "#92400e" }}>Make Offer</button>}
                        {app.status === STATUS_VALUE.Offered && <button disabled={busy === app.id} onClick={() => run(app.id, () => applicationApi.hire(app.id, "Final hiring decision"))} style={{ ...btn, background: "#dcfce7", color: "#166534" }}>Hire</button>}
                        {app.status !== STATUS_VALUE.Hired && <button disabled={busy === app.id} onClick={() => run(app.id, () => reject(app))} style={{ ...btn, background: "#fee2e2", color: "#991b1b" }}>Reject</button>}
                      </div></td>
                    </tr>
                  );
                })}</tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
