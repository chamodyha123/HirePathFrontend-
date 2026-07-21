// src/pages/candidate/Profile.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ProfileForm } from './ProfileForm';
import AIResumeParser from '../../components/AIResumeParser';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Avatar,
  Chip,
  Grid,
  Card,
  CardContent,
  Divider,
  Stack,
  IconButton,
  Tooltip,
  LinearProgress,
  Alert,
  Snackbar,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Fade,
  Zoom,
  Grow,
  useTheme,
  useMediaQuery,
  alpha,
  Modal,
} from '@mui/material';
import {
  Edit,
  LocationOn,
  Work,
  School,
  LinkedIn,
  GitHub,
  Language,
  Phone,
  Person,
  CalendarToday,
  Description,
  Star,
  TrendingUp,
  Verified,
  Public,
  Favorite,
  Code,
  Share,
  Download,
  Psychology,
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';

// ============================================
// ANIMATIONS
// ============================================
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// ============================================
// STYLED COMPONENTS
// ============================================
const GradientBackground = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
  minHeight: '100vh',
  padding: theme.spacing(4),
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.03) 0%, transparent 50%)',
    pointerEvents: 'none',
  },
}));

const GlassCard = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: theme.spacing(3),
  padding: theme.spacing(4),
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
    background: 'rgba(255, 255, 255, 0.9)',
  },
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  fontSize: 48,
  fontWeight: 700,
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
  transition: 'all 0.3s ease',
  animation: `${float} 3s ease-in-out infinite`,
  '&:hover': {
    transform: 'scale(1.05) rotate(-5deg)',
  },
  [theme.breakpoints.down('sm')]: {
    width: 80,
    height: 80,
    fontSize: 32,
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: 'white',
  padding: '10px 30px',
  borderRadius: '12px',
  fontWeight: 600,
  textTransform: 'none',
  transition: 'all 0.3s ease',
  boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
  '&:hover': {
    transform: 'translateY(-2px) scale(1.02)',
    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
  },
}));

const StatCard = styled(Card)(({ theme }) => ({
  background: 'white',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(2),
  transition: 'all 0.3s ease',
  cursor: 'default',
  border: '1px solid rgba(0,0,0,0.05)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const SkillChip = styled(Chip)(({ theme, level }) => {
  const baseStyles = {
    padding: theme.spacing(1, 0.5),
    fontWeight: 600,
    transition: 'all 0.3s ease',
  };
  
  if (level === 'Expert') {
    return {
      ...baseStyles,
      background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
      color: '#1e40af',
      border: '2px solid #93c5fd',
      '&:hover': {
        transform: 'scale(1.05)',
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
      },
    };
  } else if (level === 'Intermediate') {
    return {
      ...baseStyles,
      background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
      color: '#065f46',
      border: '2px solid #6ee7b7',
      '&:hover': {
        transform: 'scale(1.05)',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
      },
    };
  } else {
    return {
      ...baseStyles,
      background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
      color: '#92400e',
      border: '2px solid #fcd34d',
      '&:hover': {
        transform: 'scale(1.05)',
        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
      },
    };
  }
});

const TimelineDot = styled(Box)(({ theme, color }) => ({
  position: 'absolute',
  left: 0,
  top: 8,
  width: 16,
  height: 16,
  borderRadius: '50%',
  background: `linear-gradient(135deg, ${color || theme.palette.primary.main}, ${color || theme.palette.primary.dark})`,
  border: '3px solid white',
  boxShadow: `0 0 0 3px ${color || theme.palette.primary.main}`,
  zIndex: 1,
  transition: 'all 0.3s ease',
  animation: `${pulse} 2s ease-in-out infinite`,
}));

const TimelineItem = styled(Box)(({ theme }) => ({
  position: 'relative',
  paddingLeft: theme.spacing(5),
  paddingBottom: theme.spacing(4),
  '&:not(:last-child)::before': {
    content: '""',
    position: 'absolute',
    left: 7,
    top: 24,
    bottom: 0,
    width: 2,
    background: `linear-gradient(to bottom, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
    opacity: 0.3,
  },
  '&:last-child': {
    paddingBottom: 0,
  },
}));

const GradientDivider = styled(Divider)(({ theme }) => ({
  background: `linear-gradient(to right, transparent, ${theme.palette.primary.main}, transparent)`,
  height: 2,
  margin: theme.spacing(3, 0),
}));

const FloatingActionButton = styled(Button)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(4),
  right: theme.spacing(4),
  borderRadius: '50%',
  minWidth: 60,
  height: 60,
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: 'white',
  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: `0 12px 48px ${alpha(theme.palette.primary.main, 0.5)}`,
  },
}));

// ============================================
// MAIN PROFILE COMPONENT
// ============================================
function Profile() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [activeTab, setActiveTab] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);
  
  // AI State
  const [showAIParser, setShowAIParser] = useState(false);
  const [skillsList, setSkillsList] = useState([]);
  const [formData, setFormData] = useState({});
  const [aiParsing, setAiParsing] = useState(false);

  // Fetch Profile
  const fetchProfileData = async (abortSignal) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        setSnackbar({
          open: true,
          message: 'No authentication token found!',
          severity: 'error',
        });
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:5139/api/Candidate', {
        signal: abortSignal,
        headers: {
          Authorization: `Bearer ${token}`,
          accept: '*/*',
        },
      });

      if (response.data) {
        setProfile(response.data);
        setSkillsList(response.data.skills || []);
        setIsEditing(false);
      } else {
        setProfile(null);
        setIsEditing(true);
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Fetch aborted');
        return;
      }
      console.error('Error fetching profile:', error);
      setProfile(null);
      setIsEditing(true);
      setSnackbar({
        open: true,
        message: 'Failed to load profile data.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchProfileData(controller.signal);

    return () => {
      controller.abort();
    };
  }, []);

  // AI Handlers
  const handleAIParseComplete = (parsedData) => {
    setAiParsing(true);
    
    try {
      const fullName = parsedData.fullName || '';
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const updatedFormData = {
        ...formData,
        firstName: firstName,
        lastName: lastName,
        summary: parsedData.summary || formData.summary || '',
        yearsOfExperience: parsedData.yearsOfExperience || formData.yearsOfExperience || 0,
        location: parsedData.location || formData.location || '',
        phoneNumber: parsedData.phone || formData.phoneNumber || '',
        linkedInUrl: parsedData.linkedInUrl || formData.linkedInUrl || '',
        portfolioUrl: parsedData.portfolioUrl || formData.portfolioUrl || '',
        gitHubUrl: parsedData.gitHubUrl || formData.gitHubUrl || '',
        languages: parsedData.languages?.join(', ') || formData.languages || '',
      };
      
      setFormData(updatedFormData);

      if (parsedData.skills && parsedData.skills.length > 0) {
        const newSkills = parsedData.skills.map(skill => ({
          skillName: skill,
          skillLevel: 'Intermediate',
          yearsOfExperience: 0
        }));

        const existingSkillNames = skillsList.map(s => s.skillName.toLowerCase());
        const uniqueNewSkills = newSkills.filter(
          s => !existingSkillNames.includes(s.skillName.toLowerCase())
        );

        if (uniqueNewSkills.length > 0) {
          setSkillsList([...skillsList, ...uniqueNewSkills]);
        }
      }

      setSnackbar({
        open: true,
        message: `✅ AI parsed ${parsedData.skills?.length || 0} skills from your resume!`,
        severity: 'success',
      });

    } catch (error) {
      console.error('Error applying AI parsed data:', error);
      setSnackbar({
        open: true,
        message: 'Failed to apply AI parsed data.',
        severity: 'error',
      });
    } finally {
      setAiParsing(false);
      setShowAIParser(false);
    }
  };

  // Render helpers
  const getInitials = () => {
    if (!profile) return '?';
    const firstInitial = profile.firstName?.[0] || '';
    const lastInitial = profile.lastName?.[0] || '';
    return `${firstInitial}${lastInitial}`.toUpperCase() || '?';
  };

  const formatDate = (d) => {
    if (!d) return 'Present';
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: 700,
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    bgcolor: 'background.paper',
    borderRadius: 4,
    boxShadow: 24,
    p: 0,
  };

  // Loading State
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#f8fafc' }}>
        <Box sx={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <Box sx={{ 
              width: 80, 
              height: 80, 
              borderRadius: '50%',
              background: `conic-gradient(from 0deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
              animation: 'spin 1s linear infinite',
              padding: 4,
            }} />
            <Box sx={{ 
              position: 'absolute', 
              top: 8, 
              left: 8, 
              right: 8, 
              bottom: 8, 
              borderRadius: '50%',
              bgcolor: 'white',
            }} />
          </Box>
          <Typography variant="h6" sx={{ mt: 3, fontWeight: 600, color: 'text.secondary' }}>
            Loading Profile...
          </Typography>
          <LinearProgress sx={{ mt: 2, borderRadius: 2 }} />
        </Box>
      </Box>
    );
  }

  // Main Render
  return (
    <GradientBackground>
      {/* AI Parser Modal */}
      <Modal
        open={showAIParser}
        onClose={() => setShowAIParser(false)}
        aria-labelledby="ai-parser-modal"
      >
        <Box sx={modalStyle}>
          <AIResumeParser
            onParsed={handleAIParseComplete}
            onClose={() => setShowAIParser(false)}
          />
        </Box>
      </Modal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%', 
            borderRadius: 2,
            boxShadow: theme.shadows[4],
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Container maxWidth="lg">
        {!profile || isEditing ? (
          <ProfileForm
            userId={profile?.userId || 3}
            existingProfile={profile}
            onSave={() => {
              setIsEditing(false);
              fetchProfileData();
            }}
            onCancel={profile ? () => setIsEditing(false) : null}
          />
        ) : (
          <Fade in timeout={800}>
            <Box>
              {/* Header Section */}
              <Grow in timeout={1000}>
                <GlassCard sx={{ mb: 4, position: 'relative', overflow: 'hidden' }}>
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -100,
                      right: -100,
                      width: 300,
                      height: 300,
                      borderRadius: '50%',
                      background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.05)}, transparent)`,
                    }}
                  />
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      flexWrap: 'wrap',
                      gap: 3,
                      position: 'relative',
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                      <ProfileAvatar>{getInitials()}</ProfileAvatar>
                      <Box>
                        <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ mb: 0.5 }}>
                          {profile.firstName} {profile.lastName}
                        </Typography>
                        {profile.headline && (
                          <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                            {profile.headline}
                          </Typography>
                        )}
                        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                          <Chip
                            icon={<LocationOn />}
                            label={profile.location || 'Location not specified'}
                            size="small"
                            variant="outlined"
                          />
                          {profile.yearsOfExperience > 0 && (
                            <Chip
                              icon={<Work />}
                              label={`${profile.yearsOfExperience} Years Experience`}
                              size="small"
                              color="primary"
                            />
                          )}
                        </Stack>
                      </Box>
                    </Box>
                    <Stack direction="row" spacing={2}>
                      <Tooltip title="Share Profile">
                        <IconButton sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                          <Share />
                        </IconButton>
                      </Tooltip>
                      <GradientButton
                        startIcon={<Edit />}
                        onClick={() => setIsEditing(true)}
                      >
                        Edit Profile
                      </GradientButton>
                    </Stack>
                  </Box>
                </GlassCard>
              </Grow>

              {/* Summary Section */}
              {profile.summary && (
                <Zoom in timeout={1200}>
                  <GlassCard sx={{ mb: 4 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box component="span" sx={{ mr: 1, fontSize: 24 }}>📝</Box>
                      Professional Summary
                    </Typography>
                    <GradientDivider />
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 2, fontSize: '1.05rem' }}>
                      {profile.summary}
                    </Typography>
                  </GlassCard>
                </Zoom>
              )}

              {/* Quick Stats */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {[
                  { icon: Work, label: 'Experience', value: `${profile.yearsOfExperience || 0} Years`, color: '#3b82f6' },
                  { icon: TrendingUp, label: 'Work Mode', value: profile.preferredWorkMode || 'N/A', color: '#10b981' },
                  { icon: Language, label: 'Languages', value: profile.languages || 'N/A', color: '#8b5cf6' },
                  { icon: Verified, label: 'Status', value: 'Active', color: '#f59e0b' },
                ].map((stat, index) => (
                  <Grid item xs={6} sm={3} key={index}>
                    <Grow in timeout={1400 + index * 200}>
                      <StatCard
                        onMouseEnter={() => setHoveredCard(index)}
                        onMouseLeave={() => setHoveredCard(null)}
                        sx={{
                          transform: hoveredCard === index ? 'translateY(-8px)' : 'none',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Box sx={{ 
                            p: 1, 
                            borderRadius: 2, 
                            bgcolor: alpha(stat.color, 0.1),
                          }}>
                            <stat.icon sx={{ color: stat.color }} />
                          </Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={500}>
                            {stat.label}
                          </Typography>
                        </Box>
                        <Typography variant="h5" fontWeight={700}>
                          {stat.value}
                        </Typography>
                      </StatCard>
                    </Grow>
                  </Grid>
                ))}
              </Grid>

              {/* Personal & Links Grid */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                  <Zoom in timeout={1600}>
                    <GlassCard>
                      <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <Person sx={{ mr: 1 }} />
                        Personal Details
                      </Typography>
                      <GradientDivider />
                      <Stack spacing={2}>
                        {[
                          { icon: CalendarToday, label: 'Date of Birth', value: profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'N/A' },
                          { icon: Person, label: 'Gender', value: profile.gender || 'N/A' },
                          { icon: Public, label: 'Nationality', value: profile.nationality || 'N/A' },
                          { icon: Favorite, label: 'Marital Status', value: profile.maritalStatus || 'N/A' },
                          { icon: Phone, label: 'Phone', value: profile.phoneNumber || 'N/A' },
                        ].map((item, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              p: 1,
                              borderRadius: 2,
                              transition: 'all 0.2s',
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                              },
                            }}
                          >
                            <Typography color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                              <item.icon fontSize="small" sx={{ mr: 1, opacity: 0.6 }} />
                              {item.label}
                            </Typography>
                            <Typography fontWeight={500}>{item.value}</Typography>
                          </Box>
                        ))}
                      </Stack>
                    </GlassCard>
                  </Zoom>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Zoom in timeout={1800}>
                    <GlassCard>
                      <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <Language sx={{ mr: 1 }} />
                        Links & Portfolios
                      </Typography>
                      <GradientDivider />
                      <Stack spacing={2}>
                        {profile.linkedInUrl && (
                          <Button
                            href={profile.linkedInUrl}
                            target="_blank"
                            startIcon={<LinkedIn />}
                            sx={{ 
                              justifyContent: 'flex-start', 
                              textTransform: 'none',
                              borderRadius: 2,
                              p: 1.5,
                              '&:hover': { bgcolor: alpha('#0077b5', 0.1) },
                            }}
                            fullWidth
                          >
                            <Typography fontWeight={500}>LinkedIn Profile</Typography>
                          </Button>
                        )}
                        {profile.gitHubUrl && (
                          <Button
                            href={profile.gitHubUrl}
                            target="_blank"
                            startIcon={<GitHub />}
                            sx={{ 
                              justifyContent: 'flex-start', 
                              textTransform: 'none',
                              borderRadius: 2,
                              p: 1.5,
                              '&:hover': { bgcolor: alpha('#24292e', 0.05) },
                            }}
                            fullWidth
                          >
                            <Typography fontWeight={500}>GitHub Profile</Typography>
                          </Button>
                        )}
                        {profile.portfolioUrl && (
                          <Button
                            href={profile.portfolioUrl}
                            target="_blank"
                            startIcon={<Code />}
                            sx={{ 
                              justifyContent: 'flex-start', 
                              textTransform: 'none',
                              borderRadius: 2,
                              p: 1.5,
                              '&:hover': { bgcolor: alpha('#10b981', 0.1) },
                            }}
                            fullWidth
                          >
                            <Typography fontWeight={500}>Portfolio Website</Typography>
                          </Button>
                        )}
                        {!profile.linkedInUrl && !profile.gitHubUrl && !profile.portfolioUrl && (
                          <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
                            No links added yet
                          </Typography>
                        )}
                      </Stack>
                    </GlassCard>
                  </Zoom>
                </Grid>
              </Grid>

              {/* Skills Section */}
              {profile.skills?.length > 0 && (
                <Zoom in timeout={2000}>
                  <GlassCard sx={{ mb: 4 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <TrendingUp sx={{ mr: 1 }} />
                      Skills & Expertise
                    </Typography>
                    <GradientDivider />
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                      {profile.skills.map((skill, index) => (
                        <Grow in timeout={2200 + index * 100} key={skill.id}>
                          <SkillChip
                            label={`${skill.skillName} • ${skill.skillLevel}`}
                            level={skill.skillLevel}
                            variant="outlined"
                            size="medium"
                          />
                        </Grow>
                      ))}
                    </Box>
                  </GlassCard>
                </Zoom>
              )}

              {/* Tabs Section */}
              <GlassCard sx={{ mb: 4 }}>
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  variant={isMobile ? 'scrollable' : 'standard'}
                  scrollButtons={isMobile ? 'auto' : false}
                  sx={{
                    '& .MuiTab-root': {
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '0.95rem',
                      minHeight: 64,
                    },
                    '& .Mui-selected': {
                      color: theme.palette.primary.main,
                    },
                    '& .MuiTabs-indicator': {
                      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      height: 3,
                    },
                  }}
                >
                  <Tab label="Experience" icon={<Work />} iconPosition="start" />
                  <Tab label="Education" icon={<School />} iconPosition="start" />
                  <Tab label="Resumes" icon={<Description />} iconPosition="start" />
                </Tabs>
                <Divider />

                {/* Experience Tab */}
                {activeTab === 0 && (
                  <Box sx={{ pt: 3 }}>
                    {profile.experiences?.length > 0 ? (
                      profile.experiences.map((exp, index) => (
                        <Fade in timeout={2400 + index * 200} key={exp.id}>
                          <TimelineItem>
                            <TimelineDot color="#3b82f6" />
                            <GlassCard sx={{ p: 3, background: 'white' }}>
                              <Typography variant="h6" fontWeight={700}>
                                {exp.jobTitle}
                              </Typography>
                              <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                                {exp.companyName}
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                                <Chip
                                  label={`${formatDate(exp.startDate)} — ${exp.isCurrent ? 'Present' : formatDate(exp.endDate)}`}
                                  size="small"
                                  variant="outlined"
                                  icon={<CalendarToday />}
                                />
                                {exp.location && (
                                  <Chip label={exp.location} size="small" variant="outlined" icon={<LocationOn />} />
                                )}
                                {exp.employmentType && (
                                  <Chip label={exp.employmentType} size="small" variant="outlined" />
                                )}
                              </Box>
                              {exp.description && (
                                <Typography variant="body2" sx={{ mt: 2, lineHeight: 1.8 }}>
                                  {exp.description}
                                </Typography>
                              )}
                            </GlassCard>
                          </TimelineItem>
                        </Fade>
                      ))
                    ) : (
                      <Typography color="text.secondary" align="center" sx={{ py: 6 }}>
                        No experience added yet
                      </Typography>
                    )}
                  </Box>
                )}

                {/* Education Tab */}
                {activeTab === 1 && (
                  <Box sx={{ pt: 3 }}>
                    {profile.educations?.length > 0 ? (
                      profile.educations.map((edu, index) => (
                        <Fade in timeout={2400 + index * 200} key={edu.id}>
                          <TimelineItem>
                            <TimelineDot color="#10b981" />
                            <GlassCard sx={{ p: 3, background: 'white' }}>
                              <Typography variant="h6" fontWeight={700}>
                                {edu.qualification}
                              </Typography>
                              <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                                {edu.institute}
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                                <Chip
                                  label={`${formatDate(edu.startDate)} — ${edu.isCurrent ? 'Present' : formatDate(edu.endDate)}`}
                                  size="small"
                                  variant="outlined"
                                  icon={<CalendarToday />}
                                />
                                {edu.fieldOfStudy && (
                                  <Chip label={edu.fieldOfStudy} size="small" variant="outlined" />
                                )}
                                {edu.grade && (
                                  <Chip label={`Grade: ${edu.grade}`} size="small" color="success" />
                                )}
                              </Box>
                            </GlassCard>
                          </TimelineItem>
                        </Fade>
                      ))
                    ) : (
                      <Typography color="text.secondary" align="center" sx={{ py: 6 }}>
                        No education added yet
                      </Typography>
                    )}
                  </Box>
                )}

                {/* Resumes Tab */}
                {activeTab === 2 && (
                  <Box sx={{ pt: 3 }}>
                    <Box sx={{ mb: 3 }}>
                      <GradientButton
                        startIcon={<Psychology />}
                        onClick={() => setShowAIParser(true)}
                        disabled={aiParsing}
                        sx={{ mr: 2 }}
                      >
                        {aiParsing ? '⏳ Parsing...' : '🤖 Parse Resume with AI'}
                      </GradientButton>
                      <Typography variant="caption" color="text.secondary" display="inline">
                        Automatically extract skills, experience, and education from your resume
                      </Typography>
                    </Box>

                    {profile.resumes?.length > 0 ? (
                      <List>
                        {profile.resumes.map((resume, index) => (
                          <Fade in timeout={2400 + index * 200} key={resume.id}>
                            <ListItem
                              sx={{
                                borderRadius: 2,
                                mb: 1,
                                transition: 'all 0.3s',
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                                  transform: 'translateX(8px)',
                                },
                              }}
                            >
                              <ListItemIcon>
                                <Description sx={{ color: theme.palette.primary.main }} />
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <Typography component="span" fontWeight={600}>
                                    {resume.fileName}
                                    {resume.isPrimary && (
                                      <Chip
                                        label="Primary"
                                        size="small"
                                        color="primary"
                                        icon={<Star sx={{ fontSize: 14 }} />}
                                        sx={{ ml: 1 }}
                                      />
                                    )}
                                  </Typography>
                                }
                              />
                              <Button
                                href={`http://localhost:5139${resume.filePath}`}
                                target="_blank"
                                variant="outlined"
                                size="small"
                                startIcon={<Download />}
                                sx={{ borderRadius: 2, textTransform: 'none' }}
                              >
                                View
                              </Button>
                            </ListItem>
                          </Fade>
                        ))}
                      </List>
                    ) : (
                      <Typography color="text.secondary" align="center" sx={{ py: 6 }}>
                        No resumes uploaded yet. Upload a resume to use AI parsing!
                      </Typography>
                    )}
                  </Box>
                )}
              </GlassCard>
            </Box>
          </Fade>
        )}
      </Container>

      {/* Floating Action Button */}
      <FloatingActionButton
        variant="contained"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <Typography variant="h5">↑</Typography>
      </FloatingActionButton>
    </GradientBackground>
  );
}

export default Profile;