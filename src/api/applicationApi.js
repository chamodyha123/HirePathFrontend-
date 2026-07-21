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


const STATUS_NAME_TO_VALUE = {
    Applied: STATUS_VALUE.Applied,
    UnderReview: STATUS_VALUE.UnderReview,
    "Under Review": STATUS_VALUE.UnderReview,
    Shortlisted: STATUS_VALUE.Shortlisted,
    InterviewScheduled: STATUS_VALUE.InterviewScheduled,
    "Interview Scheduled": STATUS_VALUE.InterviewScheduled,
    Interviewed: STATUS_VALUE.Interviewed,
    Offered: STATUS_VALUE.Offered,
    Hired: STATUS_VALUE.Hired,
    Rejected: STATUS_VALUE.Rejected,
    Withdrawn: STATUS_VALUE.Withdrawn,
};

export function normalizeStatus(value) {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
        const numeric = Number(value);
        if (Number.isFinite(numeric) && numeric > 0) return numeric;
        return STATUS_NAME_TO_VALUE[value] ?? STATUS_NAME_TO_VALUE[value.replace(/\s+/g, "")] ?? 0;
    }
    return 0;
}

export function normalizeCollection(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.$values)) return data.$values;
    if (Array.isArray(data?.items)) return data.items;
    return [];
}

export function normalizeApplication(application) {
    return {
        ...application,
        status: normalizeStatus(application?.status),
        interviews: normalizeCollection(application?.interviews),
        statusHistory: normalizeCollection(application?.statusHistory),
    };
}

export function statusLabel(statusValue) {
    return APPLICATION_STATUS[normalizeStatus(statusValue)] || "Unknown";
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