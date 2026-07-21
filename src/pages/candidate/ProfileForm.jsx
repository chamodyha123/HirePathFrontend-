// src/pages/candidate/ProfileForm.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import candidateService from '../../api/candidateService';
import AIResumeParser from '../../components/AIResumeParser';
import {
  Box,
  Paper,
  Grid,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
  Chip,
  IconButton,
  Alert,
  Snackbar,
  Divider,
  Stack,
  CircularProgress,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  Modal,
  InputAdornment, // ← ADD THIS
} from '@mui/material';
import {
  Save,
  Cancel,
  Add,
  Delete,
  Upload,
  LinkedIn,
  GitHub,
  Language,
  Work,
  School,
  Person,
  Phone,
  LocationOn,
  AutoAwesome,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import './Profile.css';

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 12px 48px rgba(0,0,0,0.12)',
  },
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(3),
  paddingBottom: theme.spacing(2),
  borderBottom: '2px solid #f0f0f0',
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(1.5),
  padding: '8px 24px',
  fontWeight: 600,
  textTransform: 'none',
}));

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

export const ProfileForm = ({ userId, existingProfile, onSave, onCancel }) => {
  // State management
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [activeTab, setActiveTab] = useState(0);
  
  // AI State
  const [showAIParser, setShowAIParser] = useState(false);
  const [aiParsing, setAiParsing] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    headline: '',
    summary: '',
    location: '',
    phoneNumber: '',
    linkedInUrl: '',
    portfolioUrl: '',
    yearsOfExperience: 0,
    dateOfBirth: '',
    gender: 'Male',
    nationality: 'Sri Lankan',
    maritalStatus: 'Single',
    preferredWorkMode: 'Remote',
    gitHubUrl: '',
    languages: 'English',
  });

  // Skills
  const [skillsList, setSkillsList] = useState([]);
  const [skill, setSkill] = useState({ skillName: '', skillLevel: 'Beginner' });

  // Resumes
  const [resumesList, setResumesList] = useState([]);
  const [file, setFile] = useState(null);
  const [isPrimary, setIsPrimary] = useState(false);

  // Experience
  const [experienceList, setExperienceList] = useState([]);
  const [exp, setExp] = useState({
    companyName: '',
    jobTitle: '',
    location: '',
    description: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    employmentType: 'Full-Time',
  });

  // Education
  const [educationList, setEducationList] = useState([]);
  const [edu, setEdu] = useState({
    institute: '',
    qualification: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    grade: '',
  });

  const loadProfileSubSections = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get('http://localhost:5139/api/Candidate', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data) {
        setSkillsList(res.data.skills || []);
        setResumesList(res.data.resumes || []);
        setExperienceList(res.data.experiences || []);
        setEducationList(res.data.educations || []);
      }
    } catch (err) {
      console.error('Error loading profile sub-sections:', err);
    }
  };

  useEffect(() => {
    if (existingProfile) {
      let formattedDate = '';
      if (existingProfile.dateOfBirth) {
        formattedDate = String(existingProfile.dateOfBirth).split('T')[0];
      }

      setFormData({
        firstName: existingProfile.firstName || '',
        lastName: existingProfile.lastName || '',
        headline: existingProfile.headline || '',
        summary: existingProfile.summary || '',
        location: existingProfile.location || '',
        phoneNumber: existingProfile.phoneNumber || '',
        linkedInUrl: existingProfile.linkedInUrl || '',
        portfolioUrl: existingProfile.portfolioUrl || '',
        yearsOfExperience: existingProfile.yearsOfExperience || 0,
        dateOfBirth: formattedDate,
        gender: existingProfile.gender || 'Male',
        nationality: existingProfile.nationality || 'Sri Lankan',
        maritalStatus: existingProfile.maritalStatus || 'Single',
        preferredWorkMode: existingProfile.preferredWorkMode || 'Remote',
        gitHubUrl: existingProfile.gitHubUrl || '',
        languages: existingProfile.languages || 'English',
      });

      setSkillsList(existingProfile.skills || []);
      setResumesList(existingProfile.resumes || []);
      setExperienceList(existingProfile.experiences || []);
      setEducationList(existingProfile.educations || []);
    }
  }, [existingProfile]);

  const getAxiosConfig = (contentType = 'application/json') => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': contentType,
        accept: '*/*',
      },
    };
  };

  // ============ AI HANDLERS ============
  const handleAIParseComplete = (parsedData) => {
    setAiParsing(true);
    
    try {
      const fullName = parsedData.fullName || '';
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const updatedFormData = {
        ...formData,
        firstName: firstName || formData.firstName,
        lastName: lastName || formData.lastName,
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

      if (parsedData.education && parsedData.education.length > 0) {
        const newEducations = parsedData.education.map(edu => ({
          institute: edu.institution || 'Unknown',
          qualification: edu.degree || 'Unknown',
          fieldOfStudy: edu.fieldOfStudy || '',
          startDate: edu.startDate ? edu.startDate.split('T')[0] : '',
          endDate: edu.endDate ? edu.endDate.split('T')[0] : '',
          isCurrent: false,
          grade: edu.grade || '',
        }));
        setEducationList([...educationList, ...newEducations]);
      }

      if (parsedData.experience && parsedData.experience.length > 0) {
        const newExperiences = parsedData.experience.map(exp => ({
          companyName: exp.company || 'Unknown',
          jobTitle: exp.title || 'Unknown',
          location: exp.location || '',
          description: exp.description || exp.responsibilities?.join(', ') || '',
          startDate: exp.startDate ? exp.startDate.split('T')[0] : '',
          endDate: exp.endDate ? exp.endDate.split('T')[0] : '',
          isCurrent: exp.isCurrent || false,
          employmentType: 'Full-Time',
        }));
        setExperienceList([...experienceList, ...newExperiences]);
      }

      setSnackbar({
        open: true,
        message: `✅ AI parsed ${parsedData.skills?.length || 0} skills, ${parsedData.experience?.length || 0} experiences, and ${parsedData.education?.length || 0} educations!`,
        severity: 'success',
      });

      autoSaveProfile(updatedFormData);

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

  const autoSaveProfile = async (data) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const profileData = {
        id: existingProfile ? existingProfile.id : 0,
        userId: existingProfile ? existingProfile.userId : Number(userId || 3),
        firstName: data.firstName,
        lastName: data.lastName,
        fullName: `${data.firstName} ${data.lastName}`,
        headline: data.headline || '',
        summary: data.summary || '',
        location: data.location || '',
        phoneNumber: data.phoneNumber || '',
        linkedInUrl: data.linkedInUrl || '',
        portfolioUrl: data.portfolioUrl || '',
        yearsOfExperience: Number(data.yearsOfExperience) || 0,
        dateOfBirth: data.dateOfBirth ? `${data.dateOfBirth}T00:00:00` : new Date().toISOString(),
        gender: data.gender || 'Male',
        nationality: data.nationality || 'Sri Lankan',
        maritalStatus: data.maritalStatus || 'Single',
        preferredWorkMode: data.preferredWorkMode || 'Remote',
        gitHubUrl: data.gitHubUrl || '',
        languages: data.languages || 'English',
      };

      if (existingProfile) {
        await axios.put('http://localhost:5139/api/Candidate', profileData, getAxiosConfig());
      } else {
        await axios.post('http://localhost:5139/api/Candidate', profileData, getAxiosConfig());
      }
      
      await loadProfileSubSections();
      
    } catch (err) {
      console.error('Auto-save failed:', err);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setSnackbar({ open: true, message: 'Session expired! Please log in again.', severity: 'error' });
        return;
      }

      const profileData = {
        id: existingProfile ? existingProfile.id : 0,
        userId: existingProfile ? existingProfile.userId : Number(userId || 3),
        firstName: formData.firstName,
        lastName: formData.lastName,
        fullName: `${formData.firstName} ${formData.lastName}`,
        headline: formData.headline || '',
        summary: formData.summary || '',
        location: formData.location || '',
        phoneNumber: formData.phoneNumber || '',
        linkedInUrl: formData.linkedInUrl || '',
        portfolioUrl: formData.portfolioUrl || '',
        yearsOfExperience: Number(formData.yearsOfExperience) || 0,
        dateOfBirth: formData.dateOfBirth ? `${formData.dateOfBirth}T00:00:00` : new Date().toISOString(),
        gender: formData.gender,
        nationality: formData.nationality,
        maritalStatus: formData.maritalStatus,
        preferredWorkMode: formData.preferredWorkMode,
        gitHubUrl: formData.gitHubUrl || '',
        languages: formData.languages || 'English',
      };

      if (existingProfile) {
        await axios.put('http://localhost:5139/api/Candidate', profileData, getAxiosConfig());
        setSnackbar({ open: true, message: '🎉 Profile updated successfully!', severity: 'success' });
      } else {
        await axios.post('http://localhost:5139/api/Candidate', profileData, getAxiosConfig());
        setSnackbar({ open: true, message: '🎉 Profile created successfully!', severity: 'success' });
      }
      onSave();
    } catch (err) {
      console.error('❌ BACKEND ERROR:', err.response?.data || err.message);
      setSnackbar({ open: true, message: 'Failed to save profile.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Skills Handlers
  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!skill.skillName.trim()) {
      setSnackbar({ open: true, message: 'Please enter a skill name.', severity: 'warning' });
      return;
    }
    try {
      await candidateService.addSkill(skill);
      setSkill({ skillName: '', skillLevel: 'Beginner' });
      await loadProfileSubSections();
      setSnackbar({ open: true, message: 'Skill added successfully!', severity: 'success' });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Error adding skill.', severity: 'error' });
    }
  };

  const handleDeleteSkill = async (id) => {
    try {
      await candidateService.deleteSkill(id);
      await loadProfileSubSections();
      setSnackbar({ open: true, message: 'Skill deleted successfully!', severity: 'success' });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Error deleting skill.', severity: 'error' });
    }
  };

  // Resume Handlers
  const handleUploadResume = async () => {
    if (!file) {
      setSnackbar({ open: true, message: 'Please select a file first!', severity: 'warning' });
      return;
    }
    try {
      const currentUserId = existingProfile ? existingProfile.userId : Number(userId || 3);
      await candidateService.uploadResume(file, isPrimary, currentUserId);
      setFile(null);
      setIsPrimary(false);
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
      await loadProfileSubSections();
      setSnackbar({ open: true, message: 'Resume uploaded successfully!', severity: 'success' });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Upload failed.', severity: 'error' });
    }
  };

  const handleDeleteResume = async (id) => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      try {
        await candidateService.deleteResume(id);
        await loadProfileSubSections();
        setSnackbar({ open: true, message: 'Resume deleted successfully!', severity: 'success' });
      } catch (err) {
        console.error(err);
        setSnackbar({ open: true, message: 'Error deleting resume.', severity: 'error' });
      }
    }
  };

  // Experience Handlers
  const handleAddExperience = async (e) => {
    e.preventDefault();
    try {
      const cleanEmploymentType = exp.employmentType.replace('-', '');
      const payload = {
        companyName: exp.companyName,
        jobTitle: exp.jobTitle,
        employmentType: cleanEmploymentType,
        isCurrent: exp.isCurrent,
        location: exp.location || '',
        description: exp.description || '',
        startDate: exp.startDate ? new Date(exp.startDate).toISOString() : new Date().toISOString(),
        endDate: exp.endDate && !exp.isCurrent ? new Date(exp.endDate).toISOString() : null,
      };
      await axios.post('http://localhost:5139/api/Candidate/experience', payload, getAxiosConfig());
      setExp({
        companyName: '',
        jobTitle: '',
        location: '',
        description: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        employmentType: 'Full-Time',
      });
      await loadProfileSubSections();
      setSnackbar({ open: true, message: 'Experience added successfully!', severity: 'success' });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Error adding experience.', severity: 'error' });
    }
  };

  const handleDeleteExperience = async (id) => {
    try {
      await axios.delete(`http://localhost:5139/api/Candidate/experience/${id}`, getAxiosConfig());
      await loadProfileSubSections();
      setSnackbar({ open: true, message: 'Experience deleted successfully!', severity: 'success' });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Error deleting experience.', severity: 'error' });
    }
  };

  // Education Handlers
  const handleAddEducation = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        institute: edu.institute,
        qualification: edu.qualification,
        fieldOfStudy: edu.fieldOfStudy || '',
        startDate: edu.startDate ? new Date(edu.startDate).toISOString() : new Date().toISOString(),
        endDate: edu.endDate && !edu.isCurrent ? new Date(edu.endDate).toISOString() : null,
        isCurrent: edu.isCurrent,
        grade: edu.grade || '',
        description: '',
        certificateUrl: '',
        city: '',
        country: '',
        educationLevel: '',
        gpa: 0,
        percentage: 0,
      };
      await axios.post('http://localhost:5139/api/Candidate/education', payload, getAxiosConfig());
      setEdu({
        institute: '',
        qualification: '',
        fieldOfStudy: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        grade: '',
      });
      await loadProfileSubSections();
      setSnackbar({ open: true, message: 'Education added successfully!', severity: 'success' });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Failed to add education.', severity: 'error' });
    }
  };

  const handleDeleteEducation = async (id) => {
    try {
      await axios.delete(`http://localhost:5139/api/Candidate/education/${id}`, getAxiosConfig());
      await loadProfileSubSections();
      setSnackbar({ open: true, message: 'Education deleted successfully!', severity: 'success' });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Error deleting education.', severity: 'error' });
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box className="profile-form-container-wide" sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
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

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* AI Parse Button */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<AutoAwesome />}
          onClick={() => setShowAIParser(true)}
          disabled={aiParsing}
          sx={{
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            color: 'white',
            borderRadius: 2,
            px: 3,
            py: 1.5,
            '&:hover': {
              background: 'linear-gradient(135deg, #6d28d9, #4338ca)',
            }
          }}
        >
          {aiParsing ? '⏳ Processing...' : '🤖 Parse Resume with AI'}
        </Button>
      </Box>

      {/* Main Profile Form */}
      <StyledPaper>
        <form onSubmit={handleProfileSubmit}>
          <SectionHeader>
            <Typography variant="h5" fontWeight={600}>
              {existingProfile ? '✏️ Edit Profile Details' : '🆕 Create Your Profile'}
            </Typography>
            <Stack direction="row" spacing={2}>
              {onCancel && (
                <ActionButton variant="outlined" onClick={onCancel} startIcon={<Cancel />}>
                  Cancel
                </ActionButton>
              )}
              <ActionButton
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<Save />}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Save Profile Info'}
              </ActionButton>
            </Stack>
          </SectionHeader>

          <Grid container spacing={3}>
            {/* First Name - FIXED: Removed InputProps */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="First Name"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Enter first name"
              />
            </Grid>

            {/* Last Name */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Last Name"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Enter last name"
              />
            </Grid>

            {/* Professional Headline */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Professional Headline"
                value={formData.headline}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                placeholder="e.g. Full Stack Developer | React & Spring Boot"
              />
            </Grid>

            {/* Professional Summary */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Professional Summary"
                multiline
                rows={4}
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="Write a brief overview about your career, goals, and core technical skills..."
              />
            </Grid>

            {/* Location */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Colombo, Sri Lanka"
              />
            </Grid>

            {/* Phone Number */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="e.g. +947XXXXXXXX"
              />
            </Grid>

            {/* Date of Birth - FIXED: Removed InputLabelProps */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Date of Birth"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>

            {/* Gender */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  label="Gender"
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Nationality */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nationality"
                value={formData.nationality}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                placeholder="e.g. Sri Lankan"
              />
            </Grid>

            {/* Marital Status */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Marital Status</InputLabel>
                <Select
                  value={formData.maritalStatus}
                  onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                  label="Marital Status"
                >
                  <MenuItem value="Single">Single</MenuItem>
                  <MenuItem value="Married">Married</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Preferred Work Mode */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Preferred Work Mode</InputLabel>
                <Select
                  value={formData.preferredWorkMode}
                  onChange={(e) => setFormData({ ...formData, preferredWorkMode: e.target.value })}
                  label="Preferred Work Mode"
                >
                  <MenuItem value="Remote">Remote</MenuItem>
                  <MenuItem value="Onsite">Onsite</MenuItem>
                  <MenuItem value="Hybrid">Hybrid</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Languages */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Languages"
                value={formData.languages}
                onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                placeholder="e.g. English, Sinhala, Tamil"
              />
            </Grid>

            {/* LinkedIn URL */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="LinkedIn URL"
                value={formData.linkedInUrl}
                onChange={(e) => setFormData({ ...formData, linkedInUrl: e.target.value })}
                placeholder="https://linkedin.com/in/username"
              />
            </Grid>

            {/* GitHub URL */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="GitHub URL"
                value={formData.gitHubUrl}
                onChange={(e) => setFormData({ ...formData, gitHubUrl: e.target.value })}
                placeholder="https://github.com/username"
              />
            </Grid>

            {/* Portfolio URL */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Portfolio URL"
                value={formData.portfolioUrl}
                onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                placeholder="https://username.github.io"
              />
            </Grid>

            {/* Years of Experience */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Years of Experience"
                value={formData.yearsOfExperience}
                onChange={(e) =>
                  setFormData({ ...formData, yearsOfExperience: parseInt(e.target.value) || 0 })
                }
                slotProps={{ input: { inputProps: { min: 0 } } }}
              />
            </Grid>
          </Grid>
        </form>
      </StyledPaper>

      {existingProfile && (
        <>
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
              <Tab label="Skills" icon={<Add />} iconPosition="start" />
              <Tab label="Resumes" icon={<Upload />} iconPosition="start" />
              <Tab label="Experience" icon={<Work />} iconPosition="start" />
              <Tab label="Education" icon={<School />} iconPosition="start" />
            </Tabs>
          </Box>

          {/* Skills Section */}
          {activeTab === 0 && (
            <StyledPaper>
              <SectionHeader>
                <Typography variant="h6" fontWeight={600}>⚡ Manage Skills</Typography>
                <Button
                  size="small"
                  startIcon={<AutoAwesome />}
                  onClick={() => setShowAIParser(true)}
                  sx={{ color: '#7c3aed' }}
                >
                  Auto-extract from Resume
                </Button>
              </SectionHeader>
              <Grid container spacing={2} alignItems="flex-end">
                <Grid item xs={12} md={5}>
                  <TextField
                    fullWidth
                    label="Skill Name"
                    value={skill.skillName}
                    onChange={(e) => setSkill({ ...skill, skillName: e.target.value })}
                    placeholder="e.g. Java, React, Spring Boot"
                    required
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Skill Level</InputLabel>
                    <Select
                      value={skill.skillLevel}
                      onChange={(e) => setSkill({ ...skill, skillLevel: e.target.value })}
                      label="Skill Level"
                    >
                      <MenuItem value="Beginner">Beginner</MenuItem>
                      <MenuItem value="Intermediate">Intermediate</MenuItem>
                      <MenuItem value="Expert">Expert</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <ActionButton
                    fullWidth
                    variant="contained"
                    onClick={handleAddSkill}
                    startIcon={<Add />}
                  >
                    Add Skill
                  </ActionButton>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {skillsList.map((item) => (
                    <Chip
                      key={item.id}
                      label={`${item.skillName} (${item.skillLevel})`}
                      onDelete={() => handleDeleteSkill(item.id)}
                      color={item.skillLevel === 'Expert' ? 'primary' : item.skillLevel === 'Intermediate' ? 'info' : 'default'}
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </Stack>
              </Box>
            </StyledPaper>
          )}

          {/* Resumes Section */}
          {activeTab === 1 && (
            <StyledPaper>
              <SectionHeader>
                <Typography variant="h6" fontWeight={600}>📄 Manage Resumes</Typography>
                <Button
                  size="small"
                  startIcon={<AutoAwesome />}
                  onClick={() => setShowAIParser(true)}
                  sx={{ color: '#7c3aed' }}
                >
                  AI Parse Resume
                </Button>
              </SectionHeader>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    startIcon={<Upload />}
                  >
                    Select Resume File (PDF, DOCX)
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setFile(e.target.files[0])}
                      hidden
                    />
                  </Button>
                  {file && (
                    <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                      Selected: {file.name}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isPrimary}
                        onChange={(e) => setIsPrimary(e.target.checked)}
                      />
                    }
                    label="Set as Primary"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <ActionButton
                    fullWidth
                    variant="contained"
                    onClick={handleUploadResume}
                    startIcon={<Upload />}
                  >
                    Upload
                  </ActionButton>
                </Grid>
              </Grid>

              <List sx={{ mt: 2 }}>
                {resumesList.map((item) => (
                  <ListItem key={item.id}>
                    <ListItemText
                      primary={item.fileName}
                      secondary={
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <a
                            href={`http://localhost:5139${item.filePath}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: '#1976d2', textDecoration: 'none' }}
                          >
                            View
                          </a>
                          {item.isPrimary && (
                            <Chip label="Primary" size="small" color="primary" />
                          )}
                        </Box>
                      }
                    />
                    <IconButton onClick={() => handleDeleteResume(item.id)} color="error">
                      <Delete />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </StyledPaper>
          )}

          {/* Experience Section */}
          {activeTab === 2 && (
            <StyledPaper>
              <SectionHeader>
                <Typography variant="h6" fontWeight={600}>💼 Add Professional Experience</Typography>
                <Button
                  size="small"
                  startIcon={<AutoAwesome />}
                  onClick={() => setShowAIParser(true)}
                  sx={{ color: '#7c3aed' }}
                >
                  Auto-fill from Resume
                </Button>
              </SectionHeader>
              <form onSubmit={handleAddExperience}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Company Name"
                      required
                      value={exp.companyName}
                      onChange={(e) => setExp({ ...exp, companyName: e.target.value })}
                      placeholder="e.g. TechCorp Inc."
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Job Title"
                      required
                      value={exp.jobTitle}
                      onChange={(e) => setExp({ ...exp, jobTitle: e.target.value })}
                      placeholder="e.g. Senior Software Engineer"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Employment Type</InputLabel>
                      <Select
                        value={exp.employmentType}
                        onChange={(e) => setExp({ ...exp, employmentType: e.target.value })}
                        label="Employment Type"
                      >
                        <MenuItem value="Full-Time">Full-Time</MenuItem>
                        <MenuItem value="Part-Time">Part-Time</MenuItem>
                        <MenuItem value="Contract">Contract</MenuItem>
                        <MenuItem value="Internship">Internship</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Location"
                      value={exp.location}
                      onChange={(e) => setExp({ ...exp, location: e.target.value })}
                      placeholder="e.g. Colombo, Sri Lanka"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Start Date"
                      value={exp.startDate}
                      onChange={(e) => setExp({ ...exp, startDate: e.target.value })}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="End Date"
                      value={exp.endDate}
                      onChange={(e) => setExp({ ...exp, endDate: e.target.value })}
                      disabled={exp.isCurrent}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={exp.isCurrent}
                          onChange={(e) =>
                            setExp({
                              ...exp,
                              isCurrent: e.target.checked,
                              endDate: e.target.checked ? '' : exp.endDate,
                            })
                          }
                        />
                      }
                      label="Currently Working Here"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Job Description"
                      multiline
                      rows={3}
                      value={exp.description}
                      onChange={(e) => setExp({ ...exp, description: e.target.value })}
                      placeholder="Describe your responsibilities, key tasks, and technologies used..."
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <ActionButton
                      type="submit"
                      variant="contained"
                      startIcon={<Add />}
                    >
                      Add Experience
                    </ActionButton>
                  </Grid>
                </Grid>
              </form>

              <List sx={{ mt: 3 }}>
                {experienceList.map((item) => (
                  <ListItem key={item.id}>
                    <ListItemText
                      primary={`${item.jobTitle} at ${item.companyName}`}
                      secondary={`${item.employmentType}${item.isCurrent ? ' • Current' : ''}`}
                    />
                    <IconButton onClick={() => handleDeleteExperience(item.id)} color="error">
                      <Delete />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </StyledPaper>
          )}

          {/* Education Section */}
          {activeTab === 3 && (
            <StyledPaper>
              <SectionHeader>
                <Typography variant="h6" fontWeight={600}>🎓 Add Education</Typography>
                <Button
                  size="small"
                  startIcon={<AutoAwesome />}
                  onClick={() => setShowAIParser(true)}
                  sx={{ color: '#7c3aed' }}
                >
                  Auto-fill from Resume
                </Button>
              </SectionHeader>
              <form onSubmit={handleAddEducation}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Institute / University"
                      required
                      value={edu.institute}
                      onChange={(e) => setEdu({ ...edu, institute: e.target.value })}
                      placeholder="e.g. University of Colombo"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Qualification"
                      required
                      value={edu.qualification}
                      onChange={(e) => setEdu({ ...edu, qualification: e.target.value })}
                      placeholder="e.g. BSc in Computer Science"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Field of Study"
                      value={edu.fieldOfStudy}
                      onChange={(e) => setEdu({ ...edu, fieldOfStudy: e.target.value })}
                      placeholder="e.g. Software Engineering"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Grade / GPA"
                      value={edu.grade}
                      onChange={(e) => setEdu({ ...edu, grade: e.target.value })}
                      placeholder="e.g. 3.8 / First Class"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Start Date"
                      value={edu.startDate}
                      onChange={(e) => setEdu({ ...edu, startDate: e.target.value })}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="End Date"
                      value={edu.endDate}
                      onChange={(e) => setEdu({ ...edu, endDate: e.target.value })}
                      disabled={edu.isCurrent}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={edu.isCurrent}
                          onChange={(e) =>
                            setEdu({
                              ...edu,
                              isCurrent: e.target.checked,
                              endDate: e.target.checked ? '' : edu.endDate,
                            })
                          }
                        />
                      }
                      label="Currently Studying Here"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <ActionButton
                      type="submit"
                      variant="contained"
                      startIcon={<Add />}
                    >
                      Add Education
                    </ActionButton>
                  </Grid>
                </Grid>
              </form>

              <List sx={{ mt: 3 }}>
                {educationList.map((item) => (
                  <ListItem key={item.id}>
                    <ListItemText
                      primary={`${item.qualification} at ${item.institute}`}
                      secondary={item.isCurrent ? 'Current' : ''}
                    />
                    <IconButton onClick={() => handleDeleteEducation(item.id)} color="error">
                      <Delete />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </StyledPaper>
          )}
        </>
      )}
    </Box>
  );
};