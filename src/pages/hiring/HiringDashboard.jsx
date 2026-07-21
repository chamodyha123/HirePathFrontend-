import { useEffect, useMemo, useState } from "react";
import HiringSidebar from "./HiringSidebar";
import applicationApi, { STATUS_VALUE, statusLabel } from "../../api/applicationApi";
import interviewApi, { INTERVIEW_TYPE } from "../../api/interviewApi";
import feedbackApi, { RECOMMENDATION } from "../../api/feedbackApi";
import evaluationApi from "../../api/evaluationApi";
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  LinearProgress,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Stack,
  Divider,
  useTheme,
  useMediaQuery,
  alpha,
  Fade,
  Grow,
  Zoom,
} from '@mui/material';
import {
  Refresh,
  Schedule,
  EventNote,
  Feedback,
  Assessment,
  Send,
  CheckCircle,
  Cancel,
  PersonAdd,
  Work,
  TrendingUp,
  People,
  AttachMoney,
  AccessTime,
  Star,
  TrendingDown,
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';

// Animations
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
`;

// Styled Components
const GradientBackground = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${alpha(theme.palette.secondary.main, 0.03)} 100%)`,
  minHeight: '100vh',
  display: 'flex',
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  padding: theme.spacing(4),
  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
  border: '1px solid rgba(226, 232, 240, 0.8)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
    borderColor: '#d1d9e6',
  },
}));

const StatCard = styled(Card)(({ theme, color }) => ({
  background: 'white',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  border: '1px solid rgba(226, 232, 240, 0.6)',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-6px)',
    boxShadow: `0 12px 40px ${alpha(color || theme.palette.primary.main, 0.15)}`,
    borderColor: color || theme.palette.primary.main,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: `linear-gradient(90deg, ${color || theme.palette.primary.main}, ${color || theme.palette.secondary.main})`,
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
  const styles = {
    fontWeight: 600,
    borderRadius: '20px',
    padding: '4px 0',
  };
  
  switch (status) {
    case 3:
      return { ...styles, bgcolor: '#dbeafe', color: '#1e40af', label: 'Shortlisted' };
    case 4:
      return { ...styles, bgcolor: '#fef3c7', color: '#92400e', label: 'Interview Scheduled' };
    case 5:
      return { ...styles, bgcolor: '#e0e7ff', color: '#3730a3', label: 'Interviewed' };
    case 6:
      return { ...styles, bgcolor: '#d1fae5', color: '#065f46', label: 'Offered' };
    case 7:
      return { ...styles, bgcolor: '#a7f3d0', color: '#064e3b', label: 'Hired' };
    default:
      return { ...styles, bgcolor: '#f1f5f9', color: '#475569', label: 'Unknown' };
  }
});

const ActionButton = styled(Button)(({ theme, actioncolor }) => ({
  borderRadius: theme.spacing(1.5),
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.75rem',
  padding: '6px 14px',
  minWidth: 'auto',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px) scale(1.02)',
  },
  '&:disabled': {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
}));

const arr = d => Array.isArray(d) ? d : (d?.$values || []);
const relevant = [
  STATUS_VALUE.Shortlisted,
  STATUS_VALUE.InterviewScheduled,
  STATUS_VALUE.Interviewed,
  STATUS_VALUE.Offered,
  STATUS_VALUE.Hired
];
const nameOf = a => a.candidateProfile?.user?.fullName || a.candidateProfile?.headline || "Candidate";
const jobOf = a => a.job?.title || a.jobTitle || "Job position";

export default function HiringDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [apps, setApps] = useState([]);
  const [interviews, setInterviews] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await applicationApi.getByCompany();
      const list = arr(data).filter(a => relevant.includes(a.status));
      setApps(list);
      const pairs = await Promise.all(list.map(async a => {
        try {
          const r = await interviewApi.getByApplication(a.id);
          return [a.id, arr(r.data)];
        } catch {
          return [a.id, []];
        }
      }));
      setInterviews(Object.fromEntries(pairs));
    } catch (e) {
      setError(e.response?.data?.message || e.response?.data || "Failed to load hiring pipeline.");
      setSnackbar({
        open: true,
        message: 'Failed to load hiring pipeline.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => ({
    scheduled: apps.filter(a => a.status === 4).length,
    awaiting: apps.filter(a => a.status === 5).length,
    offered: apps.filter(a => a.status === 6).length,
    hired: apps.filter(a => a.status === 7).length,
    total: apps.length,
  }), [apps]);

  const run = async (id, work) => {
    setBusy(id);
    try {
      await work();
      await load();
      setSnackbar({
        open: true,
        message: 'Action completed successfully!',
        severity: 'success',
      });
    } catch (e) {
      const msg = e.response?.data?.message || e.response?.data || e.message || "Action failed.";
      setSnackbar({
        open: true,
        message: msg,
        severity: 'error',
      });
    } finally {
      setBusy(null);
    }
  };

  const schedule = async app => {
    const date = prompt(
      "Interview date/time (example 2026-07-25T10:30):",
      new Date(Date.now() + 86400000).toISOString().slice(0, 16)
    );
    if (!date) return;
    const type = prompt("Type: Online, Physical or Phone", INTERVIEW_TYPE.Online) || INTERVIEW_TYPE.Online;
    let link = null, location = null;
    if (type.toLowerCase() === 'online') link = prompt("Meeting link:", "https://meet.google.com/") || null;
    else location = prompt("Location:", "Company office") || null;
    const panel = prompt("Interview panel names/emails:", "") || null;
    const notes = prompt("Notes:", "") || null;
    await interviewApi.schedule(
      app.id,
      new Date(date).toISOString(),
      type,
      link,
      location,
      panel,
      notes
    );
  };

  const reschedule = async (app, interview) => {
    const date = prompt(
      "New interview date/time:",
      new Date(interview.scheduledAt).toISOString().slice(0, 16)
    );
    if (!date) return;
    await interviewApi.update(interview.id, {
      scheduledAt: new Date(date).toISOString(),
      meetingLink: interview.meetingLink,
      location: interview.location,
      panel: interview.panel,
      notes: interview.notes,
      status: 'Rescheduled'
    });
  };

  const feedback = async (app, interview) => {
    if (!interview) throw new Error("No interview found.");
    const technical = Number(prompt("Technical score (0-10):", "7"));
    const communication = Number(prompt("Communication score (0-10):", "7"));
    const problem = Number(prompt("Problem solving score (0-10):", "7"));
    const comments = prompt("Feedback comments:", "Good candidate");
    if (comments === null) return;
    const recommendation = prompt(
      "Recommendation: Hire, Hold or Reject",
      RECOMMENDATION.Hire
    ) || RECOMMENDATION.Hire;
    await feedbackApi.submit(
      interview.id,
      technical,
      communication,
      problem,
      comments,
      recommendation
    );
    await applicationApi.markInterviewCompleted(app.id, comments);
  };

  const evaluate = async app => {
    const resume = prompt("Resume score 0-100 (blank = existing AI score):", "");
    const ai = prompt("AI score 0-100 (blank = existing match score):", "");
    const { data } = await evaluationApi.createOrUpdate(
      app.id,
      resume === '' ? null : Number(resume),
      ai === '' ? null : Number(ai)
    );
    alert(`Evaluation saved. Overall score: ${data.overallScore ?? 'N/A'}`);
  };

  const statCards = [
    { label: 'Total Candidates', value: stats.total, icon: People, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Interviews Scheduled', value: stats.scheduled, icon: EventNote, color: '#f59e0b', bg: '#fef3c7' },
    { label: 'Awaiting Decision', value: stats.awaiting, icon: AccessTime, color: '#8b5cf6', bg: '#f3e8ff' },
    { label: 'Offers Made', value: stats.offered, icon: AttachMoney, color: '#10b981', bg: '#d1fae5' },
    { label: 'Hired', value: stats.hired, icon: CheckCircle, color: '#059669', bg: '#a7f3d0' },
  ];

  return (
    <GradientBackground>
      <HiringSidebar />
      
      <Box component="main" sx={{ flex: 1, p: { xs: 2, sm: 3, md: 4 }, overflowX: 'hidden' }}>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert severity={snackbar.severity} sx={{ borderRadius: 2, boxShadow: 3 }}>
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
              🚀 Hiring Manager Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage applications, interviews, feedback, evaluations, offers and final hiring decisions.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={load}
            disabled={loading}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1.5,
            }}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={2.4} key={stat.label}>
              <Grow in timeout={300 + index * 100}>
                <StatCard color={stat.color}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {stat.label}
                      </Typography>
                      <Typography variant="h3" fontWeight={700} sx={{ mt: 1, color: stat.color }}>
                        {stat.value}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: stat.bg,
                        animation: `${float} 3s ease-in-out ${index * 0.5}s infinite`,
                      }}
                    >
                      <stat.icon sx={{ color: stat.color, fontSize: 28 }} />
                    </Box>
                  </Box>
                </StatCard>
              </Grow>
            </Grid>
          ))}
        </Grid>

        {/* Main Table */}
        <StyledPaper>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                📋 Application & Interview Pipeline
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Live candidate data from SQL Server through the backend APIs.
              </Typography>
            </Box>
            <Chip
              label={`${apps.length} candidates`}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {String(error)}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <LinearProgress sx={{ maxWidth: 400, mx: 'auto', mb: 2, borderRadius: 2 }} />
              <Typography color="text.secondary">Loading pipeline data...</Typography>
            </Box>
          ) : apps.length === 0 ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No candidates in pipeline
              </Typography>
              <Typography variant="body2" color="text.secondary">
                There are no shortlisted candidates or interviews at the moment.
              </Typography>
            </Box>
          ) : (
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Candidate</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Job Position</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Interview</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Match</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {apps.map((app, index) => {
                    const list = interviews[app.id] || [];
                    const interview = list.find(x => [1, 4].includes(x.status)) || list.at(-1);
                    return (
                      <Fade in timeout={400 + index * 50} key={app.id}>
                        <TableRow
                          sx={{
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.02),
                              transition: 'background 0.2s',
                            },
                          }}
                        >
                          <TableCell>
                            <Typography fontWeight={600}>{nameOf(app)}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {app.candidateProfile?.user?.email || "Candidate profile"}
                            </Typography>
                          </TableCell>
                          <TableCell>{jobOf(app)}</TableCell>
                          <TableCell>
                            <StatusChip
                              status={app.status}
                              label={statusLabel(app.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {interview ? (
                              <Box>
                                <Typography variant="body2" fontWeight={500}>
                                  {new Date(interview.scheduledAt).toLocaleString()}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {interview.meetingLink || interview.location || interview.interviewType}
                                </Typography>
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                Not scheduled
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {app.matchScore != null ? (
                              <Chip
                                label={`${app.matchScore}%`}
                                size="small"
                                color={app.matchScore >= 80 ? 'success' : app.matchScore >= 60 ? 'warning' : 'error'}
                                variant="outlined"
                              />
                            ) : (
                              '—'
                            )}
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                              {app.status === 3 && !interview && (
                                <ActionButton
                                  size="small"
                                  variant="contained"
                                  color="primary"
                                  startIcon={<Schedule />}
                                  onClick={() => run(app.id, () => schedule(app))}
                                  disabled={busy === app.id}
                                >
                                  Schedule
                                </ActionButton>
                              )}
                              {interview && [1, 4].includes(interview.status) && (
                                <>
                                  <ActionButton
                                    size="small"
                                    variant="outlined"
                                    color="info"
                                    startIcon={<EventNote />}
                                    onClick={() => run(app.id, () => reschedule(app, interview))}
                                    disabled={busy === app.id}
                                  >
                                    Reschedule
                                  </ActionButton>
                                  <ActionButton
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                    startIcon={<Cancel />}
                                    onClick={() => run(app.id, () => interviewApi.cancel(interview.id, "Cancelled by Hiring Manager"))}
                                    disabled={busy === app.id}
                                  >
                                    Cancel
                                  </ActionButton>
                                  <ActionButton
                                    size="small"
                                    variant="contained"
                                    color="success"
                                    startIcon={<Feedback />}
                                    onClick={() => run(app.id, () => feedback(app, interview))}
                                    disabled={busy === app.id}
                                  >
                                    Feedback
                                  </ActionButton>
                                </>
                              )}
                              {[5, 6].includes(app.status) && (
                                <ActionButton
                                  size="small"
                                  variant="contained"
                                  color="secondary"
                                  startIcon={<Assessment />}
                                  onClick={() => run(app.id, () => evaluate(app))}
                                  disabled={busy === app.id}
                                >
                                  Evaluate
                                </ActionButton>
                              )}
                              {app.status === 5 && (
                                <ActionButton
                                  size="small"
                                  variant="contained"
                                  startIcon={<AttachMoney />}
                                  sx={{ bgcolor: '#f59e0b', '&:hover': { bgcolor: '#d97706' } }}
                                  onClick={() => run(app.id, () => applicationApi.offer(app.id, "Offer approved by Hiring Manager"))}
                                  disabled={busy === app.id}
                                >
                                  Make Offer
                                </ActionButton>
                              )}
                              {app.status === 6 && (
                                <ActionButton
                                  size="small"
                                  variant="contained"
                                  color="success"
                                  startIcon={<PersonAdd />}
                                  onClick={() => run(app.id, () => applicationApi.hire(app.id, "Final hiring decision"))}
                                  disabled={busy === app.id}
                                >
                                  Hire
                                </ActionButton>
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      </Fade>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </StyledPaper>
      </Box>
    </GradientBackground>
  );
}