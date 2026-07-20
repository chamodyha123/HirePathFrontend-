import api from "./axios";

// Mirrors the backend's ApplicationStatus enum (Models/Enums/ApplicationStatus.cs).
// The API returns/accepts these as numbers, so this map is what turns them
// into readable labels and back again.
export const APPLICATION_STATUS = {
    1: "Applied",
    2: "Under Review",
    3: "Shortlisted",
    4: "Interview Scheduled",
    5: "Interviewed",
    6: "Offered",
    7: "Hired",
    8: "Rejected",
    9: "Withdrawn",
};

export const STATUS_VALUE = {
    Applied: 1,
    UnderReview: 2,
    Shortlisted: 3,
    InterviewScheduled: 4,
    Interviewed: 5,
    Offered: 6,
    Hired: 7,
    Rejected: 8,
    Withdrawn: 9,
};

// Statuses that mean "this application is done, no more actions."
export const TERMINAL_STATUSES = [
    STATUS_VALUE.Hired,
    STATUS_VALUE.Rejected,
    STATUS_VALUE.Withdrawn,
];

export function statusLabel(statusValue) {
    return APPLICATION_STATUS[statusValue] || "Unknown";
}

const applicationApi = {
    // Candidate
    // resumeId is optional — the backend falls back to the candidate's
    // primary resume when it's omitted.
    apply: (jobId, coverLetter, resumeId) =>
        api.post("/Application/apply", { jobId, coverLetter, resumeId: resumeId || null }),

    getMine: () => api.get("/Application/mine"),

    withdraw: (id) => api.put(`/Application/withdraw/${id}`),

    // Shared
    getById: (id) => api.get(`/Application/${id}`),

    // Recruiter / Hiring Manager / Admin
    getByJob: (jobId) => api.get(`/Application/job/${jobId}`),

    getByCompany: () => api.get("/Application/company"),

    updateStatus: (applicationId, status, feedback) =>
        api.put("/Application/status", { applicationId, status, feedback }),

    shortlist: (applicationId, notes) =>
        api.put("/Application/shortlist", { applicationId, notes }),

    reject: (applicationId, notes) =>
        api.put("/Application/reject", { applicationId, notes }),

    markInterviewCompleted: (applicationId, notes) =>
        api.put("/Application/interview", { applicationId, notes }),

    offer: (applicationId, notes) =>
        api.put("/Application/offer", { applicationId, notes }),

    hire: (applicationId, notes) =>
        api.put("/Application/hire", { applicationId, notes }),

    addNotes: (id, notes) =>
        api.put(`/Application/notes/${id}`, notes, {
            headers: { "Content-Type": "application/json" },
        }),

    // Admin
    getByCandidate: (candidateProfileId) =>
        api.get(`/Application/candidate/${candidateProfileId}`),

    remove: (id) => api.delete(`/Application/${id}`),
};

export default applicationApi;